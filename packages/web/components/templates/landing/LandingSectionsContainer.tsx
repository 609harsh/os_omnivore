import Link from 'next/link'
import { VStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { ArrowRight } from 'phosphor-react'
import { LandingSection } from './LandingSection'

const buttonStyles = {
  display: 'flex',
  borderRadius: 4,
  px: 30,
  background: 'rgb(255, 210, 52)',
  color: '#3D3D3D',
}

const arrowStyles = {
  marginLeft: 10,
  padding: 2,
}

export function GetStartedButton(): JSX.Element {
  return (
    <Button style="ctaDarkYellow" css={buttonStyles}>
      <Link passHref href="/login">
        <a style={{ textDecoration: 'none', color: '#3D3D3D' }}>
          Sign Up for Free
        </a>
      </Link>
      <ArrowRight
        size={18}
        width={18}
        height={18}
        style={arrowStyles}
        color="black"
        fontWeight="800"
      />
    </Button>
  )
}

const containerStyles = {
  px: '2vw',
  pt: 32,
  pb: 100,
  width: '100%',
  maxWidth: '1224px',
  background:
    'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), linear-gradient(0deg, rgba(253, 250, 236, 0.7), rgba(253, 250, 236, 0.7))',
  '@mdDown': {
    pt: 50,
  },
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '100px',
  },
}

const reversedSectionStyles = {
  flexDirection: 'row-reverse',
  marginBottom: 20,
  '@mdDown': {
    width: '100%',
  },
}

const callToActionStyles = {
  background: 'white',
  borderRadius: '24px',
  boxSizing: 'border-box',
  border: '1px solid #D8D7D5',
  boxShadow:
    '0px 7px 8px rgba(32, 31, 29, 0.03), 0px 18px 24px rgba(32, 31, 29, 0.03)',
  padding: 40,
  marginTop: 64,
  minheight: 330,
  width: 'inherit',

  '@md': {
    width: '100%',
  },
  '@xl': {
    width: '95%',
  },
}

const callToActionText = {
  color: '#3D3D3D',
  fontWeight: '700',
  fontSize: 64,
  lineHeight: '70px',
  textAlign: 'center',
  padding: '20px',
}

export function LandingSectionsContainer(): JSX.Element {
  // const iconColor = 'rgb(255, 210, 52)'
  return (
    <VStack alignment="center" distribution="start" css={containerStyles}>
      <Box
        css={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '120px',
          '@mdDown': {
            margin: '0 0 10px 0',
          },
        }}
      >
        <img
          srcSet="/static/landing/landingPage-1.png,
                  /static/landing/landingPage-1@2x.png 2x,
                  /static/landing/landingPage-1@3x.png 3x"
          alt="landingHero-1"
          style={{
            width: '70%',
            maxWidth: '70%',
          }}
        />
      </Box>

      <LandingSection
        titleText="Unclutter your reading."
        descriptionText={
          <p>
            Omnivore strips away the ads, trackers, and clutter and formats
            pages for easy reading without distractions. The text-focused view
            also makes articles smaller and quicker to load.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-2.png,
                      /static/landing/landingPage-2@2x.png 2x,
                      /static/landing/landingPage-2@3x.png 3x"
            alt="landing-2"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Save links from anywhere. Forever."
        descriptionText={
          <>
            <p>
              With the Omnivore app for iOS and Android and extensions for all
              major web browsers, you can add to your reading list any time.
            </p>
            <p>
              Saved articles remain in your Omnivore library forever — even if
              the site where you found them goes away. Access them any time in
              our reader view or in their original format.
            </p>
          </>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-3.png,
                      /static/landing/landingPage-3@2x.png,
                      /static/landing/landingPage-3@3x.png 3x"
            alt="landing-3"
            style={{ maxWidth: '100%' }}
          />
        }
        containerStyles={reversedSectionStyles}
      />

      <LandingSection
        titleText="All your newsletters in one place."
        descriptionText={
          <p>
            Send subscriptions directly to your Omnivore library, and read them
            on your own time, away from the constant distractions and
            interruptions of your email inbox.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-4.png,
                      /static/landing/landingPage-4@2x.png 2x,
                      /static/landing/landingPage-4@3x.png 3x"
            alt="landing-4"
            style={{ maxWidth: '100%' }}
          />
        }
      />

      <LandingSection
        titleText="Stay organized and in control."
        descriptionText={
          <p>
            Read what you want, not what some algorithm says you should. Keep
            your reading organized and easily available with labels, filters,
            and fully indexed text searches.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-5.png,
                      /static/landing/landingPage-5@2x.png 2x,
                      /static/landing/landingPage-5@3x.png 3x"
            alt="landing-5"
            style={{ maxWidth: '100%' }}
          />
        }
        containerStyles={reversedSectionStyles}
      />

      <LandingSection
        titleText="Built for advanced users."
        descriptionText={
          <p>
            The intuitive command palette puts basic and advanced functionality
            at your fingertips. Keyboard shortcuts for all features mean your
            hands never have to leave the keyboard. Our open-source app allows
            integrations with knowledge bases and note-taking apps, using
            plug-ins or by triggering webhooks.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-6.png,
                    /static/landing/landingPage-6@2x.png 2x,
                    /static/landing/landingPage-6@3x.png 3x"
            alt="landing-6"
            style={{ maxWidth: '100%' }}
          />
        }
      />
      <LandingSection
        titleText="Listen to what you're reading."
        descriptionText={
          <p>
            Omnivore for iOS features realistic humanlike text-to-speech. So you
            can give your eyes a break and listen to any article saved to your
            library.
          </p>
        }
        image={
          <img
            srcSet="/static/landing/landingPage-7.png,
            /static/landing/landingPage-7@2x.png 2x,
            /static/landing/landingPage-7@3x.png 3x"
            alt="landing-7"
            style={{ maxWidth: '100%' }}
          />
        }
        containerStyles={reversedSectionStyles}
      />
      <VStack alignment="center" css={callToActionStyles}>
        <Box css={callToActionText}>Get Started With Omnivore Today</Box>
        <GetStartedButton />
      </VStack>
    </VStack>
  )
}
