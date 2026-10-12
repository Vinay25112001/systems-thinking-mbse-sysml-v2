/*
 * SysMLBatchCheck - headless batch validator for SysML v2 textual files.
 *
 * Drives org.omg.sysml.interactive.SysMLInteractive from the OMG SysML v2
 * Pilot Implementation (Jupyter kernel jar) so that ONE JVM loads the standard
 * library once and then parses + validates many files.
 *
 * Usage:
 *   java -cp <kernel-jar>;<classes-dir> SysMLBatchCheck <library-dir> <file-list.txt>
 *
 * <file-list.txt> is UTF-8, one absolute path per line.
 * For each file one line is written to stdout:
 *   @@RESULT {"file":..., "status":"PASS|FAIL|ERROR", "issues":[...], "exception":...}
 * Other stdout/stderr output (library loading chatter) is not part of the protocol.
 *
 * Each file is validated in isolation: after validation its resource is
 * removed from the resource set and never added to the global index, so a
 * name defined in one file cannot satisfy a reference in another.
 *
 * Note: SysMLInteractive.process()/removeResource() are deliberately NOT used:
 * removeResource() calls Resource.delete(), which targets a relative file URI
 * ("<n>.sysml") in the working directory. We detach the resource in memory instead.
 */

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.diagnostics.Severity;
import org.eclipse.xtext.validation.Issue;
import org.omg.sysml.interactive.SysMLInteractive;

public class SysMLBatchCheck {

    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("usage: SysMLBatchCheck <library-dir> <file-list.txt>");
            System.exit(64);
        }
        String libraryDir = args[0].replace('\\', '/');
        Path listFile = Paths.get(args[1]);

        long t0 = System.nanoTime();
        SysMLInteractive interactive = SysMLInteractive.createInstance();
        interactive.loadLibrary(libraryDir);
        // Sanity check that the standard library really loaded: a known library
        // element must resolve. If it does not, every result would be meaningless.
        boolean libOk = interactive.resolve("ISQBase::MassValue") != null
                && interactive.resolve("ScalarValues::Real") != null;
        System.out.println("@@LIBRARY " + "{\"dir\":" + q(libraryDir)
                + ",\"resolvedProbe\":" + libOk
                + ",\"javaVersion\":" + q(System.getProperty("java.runtime.version"))
                + ",\"javaVendor\":" + q(System.getProperty("java.vendor"))
                + ",\"loadSeconds\":" + String.format(java.util.Locale.ROOT, "%.1f", (System.nanoTime() - t0) / 1e9) + "}");
        if (!libOk) {
            System.err.println("Standard library did not load from " + libraryDir);
            System.exit(3);
        }

        List<String> files = Files.readAllLines(listFile, StandardCharsets.UTF_8);
        for (String f : files) {
            f = f.strip();
            if (f.isEmpty()) continue;
            System.out.println("@@RESULT " + check(interactive, f));
            System.out.flush();
        }
        System.out.println("@@DONE");
        System.out.flush();
        System.exit(0);
    }

    private static String check(SysMLInteractive interactive, String file) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"file\":").append(q(file));
        String text;
        try {
            text = Files.readString(Paths.get(file), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return sb.append(",\"status\":\"ERROR\",\"issues\":[],\"exception\":")
                    .append(q("cannot read file: " + e)).append("}").toString();
        }
        interactive.next(SysMLInteractive.SYSML_EXTENSION);
        Resource resource = interactive.getResource();
        try {
            interactive.parse(text);
            List<Issue> issues = interactive.validate();
            boolean hasError = false;
            StringBuilder is = new StringBuilder("[");
            boolean first = true;
            for (Issue issue : issues) {
                if (issue.getSeverity() == Severity.ERROR) hasError = true;
                if (!first) is.append(',');
                first = false;
                is.append("{\"severity\":").append(q(String.valueOf(issue.getSeverity())))
                  .append(",\"line\":").append(issue.getLineNumber() == null ? "null" : issue.getLineNumber().toString())
                  .append(",\"column\":").append(issue.getColumn() == null ? "null" : issue.getColumn().toString())
                  .append(",\"code\":").append(issue.getCode() == null ? "null" : q(issue.getCode()))
                  .append(",\"syntax\":").append(issue.isSyntaxError())
                  .append(",\"message\":").append(q(issue.getMessage()))
                  .append('}');
            }
            is.append(']');
            boolean empty = interactive.getRootElement() == null;
            sb.append(",\"status\":").append(q(hasError ? "FAIL" : "PASS"))
              .append(",\"emptyModel\":").append(empty)
              .append(",\"issues\":").append(is).append(",\"exception\":null}");
        } catch (Exception e) {
            sb.append(",\"status\":\"ERROR\",\"issues\":[],\"exception\":").append(q(e.toString())).append('}');
        } finally {
            if (resource != null) {
                try { resource.unload(); } catch (Exception ignored) { }
                if (resource.getResourceSet() != null) {
                    resource.getResourceSet().getResources().remove(resource);
                }
            }
        }
        return sb.toString();
    }

    private static String q(String s) {
        if (s == null) return "null";
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 0x20 || c > 0x7e) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        return b.append('"').toString();
    }
}
