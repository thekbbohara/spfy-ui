import { writeFile } from "fs/promises";
import { resolve } from "path";

const writeCn = async (utilsdir: string): Promise<void> => {
  console.log("Writing", utilsdir, "cn.ts");
  await writeFile(
    resolve(utilsdir, "cn.ts"),
    'import { ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\nconst cn = (...inputs: ClassValue[]) => {\n\treturn twMerge(clsx(inputs));\n};\nexport default cn;',
    "utf8",
  );
};
const writeIndex = async (spfyiconpath: string): Promise<void> => {
  console.log("Writing", spfyiconpath);
  await writeFile(
    spfyiconpath,
    'import { createIcon } from "@/utils/createIcon";',
    "utf8",
  );
};
const writeCreateIcon = async (utilsdir: string): Promise<void> => {
  console.log("Writing", utilsdir, "cn.ts");
  await writeFile(
    resolve(utilsdir, "createIcon.ts"),
    `interface IconProps {
  size?: number;
  className?: string;
}
import React from "react";
import cn from "./cn";
export const createIcon = (d: string): React.FC<IconProps> => {
  console.log(d);
  return ({ size = 24, className, ...restProps }: IconProps) =>
    React.createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        className: cn(
          "fill-s1 w-6 h-6 flex justify-center items-center",
          className,
        ),
        ...restProps,
      },
      React.createElement("path", { d }),
    );
};`,
  );
};

const writeSetupFiles = async (
  utilsdir: string,
  spfyiconspath: string,
): Promise<void> => {
  await writeCn(utilsdir);
  await writeCreateIcon(utilsdir);
  await writeIndex(spfyiconspath);
};
export default writeSetupFiles;
