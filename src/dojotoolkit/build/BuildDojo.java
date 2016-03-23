package dojotoolkit.build;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BuildDojo {
    protected static Logger logger = LoggerFactory.getLogger(BuildDojo.class);

    private static final String fileRootPath = "/home/apple/workspace/weichuang-workspace/dojotoolkit";
    private static final String webFileRootPath = fileRootPath + "/WebContent";
    private static final String dojoSrcFileRootPath = fileRootPath + "/dojo-src";
    private static final boolean createDestDir = true;
    private static final String suffix = ".uncompressed.js";

    private static final String[] dojos = {"dojo","dijit","dojox"};

    public static void main(String[] args) throws IOException {
        for (String dojoComponent : dojos) {
            build(dojoComponent);
        }
    }

    /**
     * 分离dojo的 *.js 与 *.uncompressed.js
     * @throws IOException
     */
    private static void build(String dojoComponent) throws IOException {
        String filePath = webFileRootPath + "/" + dojoComponent;
        logger.info("filePath : "+filePath);
        //列出所有指定后缀名称的文件.
        List<File> files = (List<File>)FileUtils.listFiles(
                new File( filePath ),
                new String[] { "js" },
                true
        );

        logger.info("js file count: "+files.size());

        for (File srcFile : files) {
            String filename = srcFile.getAbsolutePath();
            if(StringUtils.endsWith(filename, suffix)) {
                String parent = srcFile.getParent();
//                logger.info("js file parent: "+parent);
                String newparent = StringUtils.replace(parent, webFileRootPath, dojoSrcFileRootPath);
//                logger.info("js file newparent: "+newparent);
                File destDir = new File(newparent);
                logger.info("js file newparent: "+destDir.getAbsolutePath());
                FileUtils.moveFileToDirectory(srcFile, destDir, createDestDir);
            }
        }
    }
}
