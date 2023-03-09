import { Box, HStack } from '../../elements/LayoutPrimitives'

export function ResetSent(): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="start"
        css={{
          width: '100vw',
          height: '100vh',
          bg: '$omnivoreYellow',
          overflowY: 'clip',
        }}
      >
        <Box
          css={{
            width: '100%',
            margin: '40px',
            color: '$omnivoreGray',
            '@xl': { margin: '138px' },
          }}
        >
          <h1>Reset email sent</h1>
          <Box>
            If there is an account associated with the email specified we sent a
            password reset link. Click the link to reset your password. You may
            need to check your spam folder.
          </Box>
        </Box>
      </HStack>
    </>
  )
}
