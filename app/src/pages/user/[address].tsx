import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const { address } = router.query

  return (
    <div className="flex flex-col items-center justify-center gap-7 flex-1">
      <h1 className="text-4xl font-bold">Profile</h1>
      <h2 className="text-2xl font-bold">{address}</h2>
    </div>
  )
}
