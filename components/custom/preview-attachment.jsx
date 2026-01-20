"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewAttachment = void 0;
var icons_1 = require("./icons");
var PreviewAttachment = function (_a) {
    var attachment = _a.attachment, _b = _a.isUploading, isUploading = _b === void 0 ? false : _b;
    var name = attachment.name, url = attachment.url, contentType = attachment.contentType;
    return (<div className="flex flex-col gap-2 max-w-16">
      <div className="h-20 w-16 bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (contentType.startsWith("image") ? (
        // NOTE: it is recommended to use next/image for images
        // eslint-disable-next-line @next/next/no-img-element
        <img key={url} src={url} alt={name !== null && name !== void 0 ? name : "An image attachment"} className="rounded-md size-full object-cover"/>) : (<div className=""></div>)) : (<div className=""></div>)}

        {isUploading && (<div className="animate-spin absolute text-zinc-500">
            <icons_1.LoaderIcon />
          </div>)}
      </div>

      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>);
};
exports.PreviewAttachment = PreviewAttachment;
