import { useRouter } from 'next/router'

const useDynamicRouteParams = () => {
  const router = useRouter()
  const pathname = router.pathname
  const { chain, address } = router.query
  return { pathname, chain, address }
}

export default useDynamicRouteParams
