/**
 * The context in which a view is rendered.
 * 
 * This can be used to change things controlled by the layout e.g. to add style links or change certain meta tags.
 */
export interface LayoutContext {
    addStyle: (c: JSX.Element) => void;
    addScript: (c: JSX.Element) => void;
    setTitle: (title?: string) => void;
    setDescription: (description?: string) => void;
}

export type RestrictedLayoutContext = Pick<LayoutContext, "addScript" | "addStyle">;

/**
 * Render a view component with a plain base layout.
 * 
 * @param Content The view component which renders the site content.
 * @param props Property values that should be passed to the content view.
 * @returns The rendered view embedded into the layout.
 */
export function withBaseLayout(Content: (this: void, props: { ctx: LayoutContext }) => JSX.Element): JSX.Element {
    // construct the context
    let styles: JSX.Element[] = [];
    let scripts: JSX.Element[] = [];
    let title: string | undefined;
    let description: string | undefined;
    const ctx: LayoutContext = {
        addStyle(c) {
            styles.push(c);
        },
        addScript(c) {
            scripts.push(c);
        },
        setTitle(newTitle) {
            title = newTitle
        },
        setDescription(newDescription) {
            description = newDescription;
        },
    }

    // render the child now to trigger its context manipulation before rendering the actual layout
    const content = Content({ctx
    });

    // render the layout
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                {/*<link rel="icon" href="/static" />*/}
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title safe>{title ? `${title} – plakatspotter.de` : "plakatspotter.de"}</title>
                {description ? <meta safe name="description" content={description} /> : undefined}
                {styles}
                {scripts}
            </head>
            <body>
                {content}
            </body>
        </html>
    )
}
