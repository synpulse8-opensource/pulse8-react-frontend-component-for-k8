# Custom Tool Renderers

Create custom components to render tool outputs like charts, tables, search results, and more.

## Creating a Tool Renderer

```tsx
import type { IToolRendererComponentProps } from '@pulse8-ai/chat'

const MyChartRenderer: React.FC<IToolRendererComponentProps> = ({ 
  output, 
  title, 
  theme 
}) => {
  // Parse the tool output
  const data = JSON.parse(output)
  
  // Render using your preferred chart library
  return (
    <div className="my-chart">
      {title && <h3>{title}</h3>}
      <MyChartLibrary data={data} />
    </div>
  )
}
```

## Registering Tool Renderers

Register the renderer via `ChatConfigProvider`:

```tsx
import { ChatConfigProvider } from '@pulse8-ai/chat'
import type { IChatConfig } from '@pulse8-ai/chat'

const config: IChatConfig = {
  toolRenderers: {
    'generate_chart': MyChartRenderer,
    'search_results': MySearchRenderer,
    'data_table': MyTableRenderer,
  },
  
  // Show these tools inline within the message
  inlineTools: ['generate_chart'],
  
  // Map tool names to friendly display names
  toolNameMapping: {
    'generate_chart': 'Chart',
    'search_results': 'Web Search',
    'data_table': 'Data Table',
  },
  
  // Optionally hide certain tools from the UI
  hiddenTools: ['internal_lookup'],
}

function App() {
  return (
    <ChatConfigProvider config={config}>
      <ChatPage />
    </ChatConfigProvider>
  )
}
```

## Tool Renderer Props

The `IToolRendererComponentProps` interface provides:

```typescript
interface IToolRendererComponentProps {
  // The JSON string output from the tool
  output: string
  
  // Optional title for the tool output
  title?: string
  
  // The current theme (for styling)
  theme: ChatTheme
}
```

## Example: Search Results Renderer

```tsx
interface SearchResult {
  title: string
  url: string
  snippet: string
}

const SearchResultsRenderer: React.FC<IToolRendererComponentProps> = ({ output, title }) => {
  const results: SearchResult[] = JSON.parse(output)
  
  return (
    <div className="search-results">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <ul className="space-y-2">
        {results.map((result, index) => (
          <li key={index} className="border-b pb-2">
            <a href={result.url} className="text-blue-500 hover:underline">
              {result.title}
            </a>
            <p className="text-sm text-gray-600">{result.snippet}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Example: Data Table Renderer

```tsx
interface TableData {
  headers: string[]
  rows: string[][]
}

const DataTableRenderer: React.FC<IToolRendererComponentProps> = ({ output, theme }) => {
  const { headers, rows }: TableData = JSON.parse(output)
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead style={{ backgroundColor: theme.colors.tableHeaderBg }}>
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-t">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Inline vs Collapsible Tools

- **Inline tools** (`inlineTools`): Rendered directly in the message content
- **Collapsible tools**: Rendered in an expandable container (default)

```tsx
const config: IChatConfig = {
  toolRenderers: {
    'chart': ChartRenderer,      // Will be inline
    'code_output': CodeRenderer, // Will be collapsible
  },
  inlineTools: ['chart'],  // Only chart is inline
}
```
