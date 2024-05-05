import type { Component } from "@kitajs/html";

export const NotFound: Component<{msg: string}> = ({msg}) => (<>
    <h1>The requested site could not be found</h1>
    <p safe>{msg}</p>
</>)