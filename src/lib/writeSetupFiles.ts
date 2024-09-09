import { writeFile } from "fs/promises";
import { resolve } from "path";

const writeCn = async (utilsdir: string): Promise<void> => {
  console.log("Writing", utilsdir, "cn.ts");
  await writeFile(
    resolve(utilsdir, "cn.ts"),
    'import { ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\nconst cn = (...inputs: ClassValue[]) => {\n\treturn twMerge(clsx(inputs));\n};\nexport default cn;',
    "utf8"
  );
};
const writeIndex = async (spfyiconpath: string): Promise<void> => {
  console.log("Writing", spfyiconpath);
  await writeFile(
    spfyiconpath,
    'import { createIcon } from "@/utils/createIcon";',
    "utf8"
  );
};
const writeCreateIcon = async (utilsdir: string): Promise<void> => {
  console.log("Writing", utilsdir, "cn.ts");
  await writeFile(
    resolve(utilsdir, "createIcon.ts"),
    `import React from "react";
import cn from "./cn";
interface IconProps {
  size?: number;
  className?: string;
}
type pathType = {
  [key: string]: string | undefined;
  d: string;
  fill?: string;
};
type svgReturnType = {
  path: pathType[];
  viewBox: string;
  [key: string]: any;
};
export const createIcon = (svgData: svgReturnType): React.FC<IconProps> => {
  const IconComponent: React.FC<IconProps> = ({
    size = 24,
    className,
    ...restProps
  }: IconProps) =>
    React.createElement(
      "svg",
      {
        viewBox: svgData.viewBox,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        className: cn(
          "w-6 h-6 text-s1 flex justify-center items-center",
          className,
        ),
        ...restProps,
      },
      svgData.path.map((p, i) =>
        React.createElement("path", { d: p?.d, key: i, fill: p?.fill }),
      ),
    );
  IconComponent.displayName = "IconComponent";
  return IconComponent;
};`
  );
};

const writeSetupFiles = async (
  utilsdir: string,
  spfyiconspath: string
): Promise<void> => {
  await writeCn(utilsdir);
  await writeCreateIcon(utilsdir);
  await writeIndex(spfyiconspath);
};
export default writeSetupFiles;
