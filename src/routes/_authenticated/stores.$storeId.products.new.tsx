import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/stores/$storeId/products/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/stores/$storeId/products/new"!</div>
}
