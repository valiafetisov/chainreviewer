import Highlight from '~/components/Highlight'

export default function Home() {
  return (
    <Highlight language="javascript">
      {`
      function foo() { 
        const helloworld = "hi"
        return 'bar' 
      }
      `}
    </Highlight>
  )
}
