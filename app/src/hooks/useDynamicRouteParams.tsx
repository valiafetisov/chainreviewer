import { useRouter } from 'next/router'

const useDynamicRouteParams = () => {
  const router = useRouter()
  const { chain, address } = router.query
  return { chain, address }
}

export default useDynamicRouteParams
