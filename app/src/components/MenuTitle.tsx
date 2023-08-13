import { Input, Button } from 'antd'
import { AiOutlineSearch, AiOutlineCloseCircle } from 'react-icons/ai'
import { useState } from 'react'

type MenuTitleProps = {
  title: string
  className?: string
  total?: number
  isLoading?: boolean
  children?: React.ReactNode
}

export const MenuTitle = ({
  title,
  className,
  total,
  isLoading,
  children,
}: MenuTitleProps) => (
  <div
    className={`w-full sticky top-0 bg-neutral-200 py-1 px-2 ${className} reverseElipsis`}
  >
    <>
      <span title={title} className="font-bold">
        {title}
      </span>
      &nbsp;
      {isLoading ? (
        <span>Loading...</span>
      ) : total !== undefined ? (
        <span>({total} total)</span>
      ) : null}
    </>
    {children ? <>{children}</> : null}
  </div>
)

export const MenuTitleWithSearch = ({
  title,
  className,
  total,
  isLoading,
  search,
  setSearch,
}: {
  title: string
  className?: string
  total?: number
  isLoading?: boolean
  search: string
  setSearch: (search: string) => void
}) => {
  const [isSearchShown, setIsSearchShown] = useState(false)

  return !isSearchShown ? (
    <div
      className={`w-full sticky top-0 bg-neutral-200 py-1 px-2 flex justify-between items-center transition duration-300 ${className}`}
    >
      <div className="flex items-center">
        <span title={title} className="font-bold reverseElipsis">
          {title}
        </span>
        &nbsp;
        {isLoading ? (
          <span>Loading...</span>
        ) : total !== undefined ? (
          <span>({total} total)</span>
        ) : null}
      </div>
      <AiOutlineSearch
        className="text-primary"
        onClick={() => setIsSearchShown(true)}
      />
    </div>
  ) : (
    <Button.Group className="transition duration-300">
      <Input
        autoFocus
        value={search}
        onChange={(val) => setSearch(val.target.value)}
        allowClear
      />
      <Button
        icon={<AiOutlineCloseCircle />}
        onClick={() => {
          setIsSearchShown(false)
          setSearch('')
        }}
      />
    </Button.Group>
  )
}
