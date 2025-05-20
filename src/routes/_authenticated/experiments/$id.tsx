import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/experiments/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/experiments/$id"!</div>
}
