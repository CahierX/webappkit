import {withPresets} from "@querycap-dev/webpack-preset";
import {withAssetsPreset} from "@querycap-dev/webpack-preset-assets";
import {withHTMLPreset} from "@querycap-dev/webpack-preset-html";
import {withTsPreset} from "@querycap-dev/webpack-preset-ts";
// @ts-ignore
import glob from "glob";
// @ts-ignore
import {set} from "lodash";
import {join} from "path";
import {load} from "js-yaml";
import * as fs from "fs";

export = withPresets(
    (c) => {
        if (process.env.HTTPS) {
            set(c, "devServer", {
                browserSync: {https: !!process.env.HTTPS},
            });
        }
    },
    withTsPreset({
        polyfill: /babel|core-js/,
        markdown: /unified|remark|remark-react/,
        d3: /d3-shape|d3-path/,
        styling: /polished|emotion|react-spring/,
        core: /react|reactorx|scheduler|history|axios/,
        utils: /buffer|date-fns|lodash|rxjs/,
    }) as any,
    (c, state) => {
        console.log(state);

        const isProd = state.flags.production;

        if (isProd && state.env == "gh-page") {
            c.output!.path = join(__dirname, `./public/web-sg/static`);
            c.output!.publicPath = `./static/`;
        }

        c.resolve!.alias = {
            path: "path-browserify",
            lodash$: "lodash-es",
        };


        ((load(String(fs.readFileSync("./pnpm-workspace.yaml"))) as any).packages as string[])
            .map((p) => glob.sync(p, {}))
            .flat()
            .forEach((k) => {
                (c.resolve!.alias as any)[`${k}$`] = `${k}/index`;
            });
    },
    withAssetsPreset() as any,
    withHTMLPreset() as any,
);
