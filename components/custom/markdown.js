"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Markdown = Markdown;
var react_1 = require("react");
var react_markdown_1 = require("react-markdown");
var rehype_highlight_1 = require("rehype-highlight");
var remark_gfm_1 = require("remark-gfm");
require("highlight.js/styles/github-dark.css");
var MemoizedReactMarkdown = (0, react_1.memo)(react_markdown_1.default, function (prevProps, nextProps) {
    return prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className;
});
exports.default = MemoizedReactMarkdown;
function Markdown(_a) {
    var children = _a.children;
    return (<MemoizedReactMarkdown className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words" remarkPlugins={[remark_gfm_1.default]} rehypePlugins={[rehype_highlight_1.default]} components={{
            p: function (_a) {
                var children = _a.children;
                return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code: function (_a) {
                var node = _a.node, className = _a.className, children = _a.children, props = __rest(_a, ["node", "className", "children"]);
                var match = /language-(\w+)/.exec(className || '');
                var isInline = !match && !String(children).includes('\n');
                if (isInline) {
                    return (<code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props}>
                {children}
              </code>);
                }
                return (<code className={className} {...props}>
              {children}
            </code>);
            },
        }}>
      {children}
    </MemoizedReactMarkdown>);
}
