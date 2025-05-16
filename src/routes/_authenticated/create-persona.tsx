import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/create-persona')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/create-persona"!</div>
}
