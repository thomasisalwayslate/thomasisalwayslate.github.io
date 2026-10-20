// Use Astro 7's existing Satteri processor; no extra Markdown dependency.
export default function articleHeadings() {
  return {
    name: 'article-permalinks',
    element: {
      filter: ['h1', 'h2', 'h3'],
      visit(node, ctx) {
        if (!ctx.data.astro?.frontmatter?.sharedArticle) return;
        if (node.tagName === 'h1') { ctx.removeNode(node); return; }
        const id = node.properties?.id;
        if (!id) return;
        const text = ctx.textContent(node);
        ctx.appendChild(node, { type: 'element', tagName: 'a', properties: {
          className: ['heading-anchor'], href: `#${id}`, ariaLabel: `Link to ${text}`,
        }, children: [{ type: 'element', tagName: 'span', properties: { ariaHidden: 'true' }, children: [{ type: 'text', value: '#' }] }] });
      },
    },
  };
}
