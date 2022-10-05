import { useState, useEffect } from 'react'
import { Clock, Sliders, X } from 'phosphor-react'
import Downshift from 'downshift'

import { HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { FormInput } from '../../elements/FormElements'
import { Button } from '../../elements/Button'
import { styled, theme } from '../../tokens/stitches.config'
import { SearchCoordinator } from './LibraryContainer'

// Styles
const List = styled('ul', {
  width: '91%',
  maxHeight: '400px',
  overflow: 'auto',
  top: '65px',
  left: '-32px',
  color: 'var(--colors-utilityTextDefault)',
  backgroundColor: 'var(--colors-grayBase)',
  position: 'absolute',
  zIndex: '2',
  '@smDown': {
    fontSize: 16,
  },
})

const Item = styled('li', {
  listStyleType: 'none',
  m: '8px',
  borderRadius: '5px',
  width: '100%',
})

export type LibrarySearchBarProps = {
  coordinator: SearchCoordinator
}

export function LibrarySearchBar(props: LibrarySearchBarProps): JSX.Element {
  const [recentSearches, setRecentSearches] = useState(Array<unknown[]>())

  useEffect(() => {
    setRecentSearches(Object.values(localStorage))
  }, [])

  return (
    <Downshift itemToString={(item) => (item ? item : '')}>
      {({
        getInputProps,
        getRootProps,
        getMenuProps,
        getItemProps,
        isOpen,
        highlightedIndex,
        inputValue,
        clearSelection,
        openMenu,
      }) => (
        <VStack
          alignment="start"
          distribution="start"
          css={{ pl: '32px', width: '100%', height: '100%' }}
        >
          <HStack
            alignment="start"
            distribution="start"
            css={{ width: '100%', borderBottom: 'solid 1px $grayBorder' }}
            {...getRootProps({ refKey: 'ref' }, { suppressRefError: true })}
          >
            <form
              style={{ width: '100%' }}
              onSubmit={(event) => {
                event.preventDefault()
                // props.applySearchQuery(searchTerm || '')
                // inputRef.current?.blur()
              }}
              {...getRootProps()}
            >
              <FormInput
                css={{
                  width: '77%',
                  height: '80px',
                  fontSize: '24px',
                  fontFamily: 'Inter',
                }}
                type="text"
                tabIndex={0}
                value={inputValue}
                placeholder="Search"
                onFocus={(event: any) => {
                  event.preventDefault()
                  openMenu()
                  //props.applySearchQuery('')
                  // inputRef.current?.blur()
                }}
                onChange={(event: any) => {
                  event.preventDefault()
                }}
                {...getInputProps()}
              />

              {/* {searchTerm && ( */}
              <HStack
                alignment="center"
                distribution="start"
                css={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'right',
                  alignItems: 'center',
                  margin: '-57px 0 10px',
                }}
              >
                <Button
                  style="plainIcon"
                  onClick={(event) => {
                    event.preventDefault()
                    clearSelection()
                    //props.applySearchQuery('')
                    // inputRef.current?.blur()
                  }}
                  css={{
                    mr: '15px',
                  }}
                >
                  <X
                    width={24}
                    height={24}
                    color={theme.colors.grayTextContrast.toString()}
                  />
                </Button>

                <Button
                  style="ctaDarkYellow"
                  type="submit"
                  css={{
                    mr: '15px',
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                    if (inputValue && inputValue.length > 0) {
                      localStorage.setItem(inputValue, inputValue)
                      setRecentSearches(Object.values(localStorage))
                    }
                    // props.applySearchQuery('')
                    // inputRef.current?.blur()
                  }}
                >
                  Search
                </Button>
                {/* )} */}
                {/* {!searchTerm && ( */}
                <Button
                  style="plainIcon"
                  onClick={(event) => {
                    // Display the advanced search sheet
                  }}
                >
                  <Sliders
                    size={24}
                    color={theme.colors.utilityTextDefault.toString()}
                  />
                </Button>
                {/* )} */}
              </HStack>

              <List>
                {isOpen &&
                  recentSearches
                    .filter((item) => !inputValue || item.includes(inputValue))
                    .map((item, index) => (
                      <SpanBox
                        {...getMenuProps()}
                        key={item}
                        css={{
                          paddingLeft: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          borderBottom: '1px solid $grayBorder',
                          '& svg': {
                            margin: '10px',
                          },
                          backgroundColor:
                            index === highlightedIndex
                              ? 'var(--colors-grayBg)'
                              : 'transparent',
                        }}
                      >
                        <Clock size={20} />
                        <Item
                          {...getItemProps({
                            item,
                            index,
                          })}
                        >
                          {item}
                        </Item>
                        <X
                          width={20}
                          height={20}
                          color={theme.colors.grayTextContrast.toString()}
                          onClick={() => {
                            localStorage.removeItem(`${item}`)
                            setRecentSearches(Object.values(localStorage))
                          }}
                        />
                      </SpanBox>
                    ))}
              </List>
            </form>
          </HStack>
        </VStack>
      )}
    </Downshift>
  )
}
