import type {Component} from "@kitajs/html";

export const Base: Component<{ title?: string, description?: string, includeHtmx?: boolean }> = ({
                                                                                                     title,
                                                                                                     description,
                                                                                                     children,
                                                                                                     includeHtmx
                                                                                                 }) => (
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        {/*<link rel="icon" href="/static" />*/}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title safe>{ title ? `${title} – plakatspotter.de` : "plakatspotter.de"}</title>
        {description ? <meta safe name="description" content={description}/> : undefined}
        {(includeHtmx ?? true) ? <script src="/public/scripts/htmx.js"></script> : undefined}
    </head>
    <body>
    {children}
    </body>
    </html>
);
