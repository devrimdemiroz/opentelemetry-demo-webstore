```mermaid

sequenceDiagram
  participant Start
  participant A as Entity A
  participant B as Entity B
  participant C as Entity C
  participant End
  Start->>A: start
  A->>B: trigger event
  B->>C: request service
  C->>B: provide service
  B->>C: next request
  C->>End: end

```
