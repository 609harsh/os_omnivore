import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import 'chai/register-should'
import fs from 'fs'
import {
  findNewsletterUrl,
  isProbablyNewsletter,
  parsePageMetadata,
  parsePreparedContent,
} from '../../src/utils/parser'
import nock from 'nock'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('isProbablyNewsletter', () => {
  it('returns true for substack newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    await expect(isProbablyNewsletter(html)).to.eventually.be.true
  })
  it('returns true for private forwarded substack newsletter', async () => {
    const html = load(
      './test/utils/data/substack-private-forwarded-newsletter.html'
    )
    await expect(isProbablyNewsletter(html)).to.eventually.be.true
  })
  it('returns false for substack welcome email', async () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    await expect(isProbablyNewsletter(html)).to.eventually.be.false
  })
  it('returns true for beehiiv.com newsletter', async () => {
    const html = load('./test/utils/data/beehiiv-newsletter.html')
    await expect(isProbablyNewsletter(html)).to.eventually.be.true
  })
})

describe('findNewsletterUrl', async () => {
  it('gets the URL from the header if it is a substack newsletter', async () => {
    nock('https://email.mg2.substack.com')
      .head(
        '/c/eJxNkk2TojAQhn-N3KTyQfg4cGDGchdnYcsZx9K5UCE0EMVAkTiKv36iHnarupNUd7rfVJ4W3EDTj1M89No496Uw0wCxgovuwBgYnbOGsZBVjDHzKPWYU8VehUMWOlIX9Qhw4rKLzXgGZziXnRTcyF7dK0iIGMVOG_OS1aTmKPRDilgVhTQUPCQIcE0x-MFTmJ8rCUpA3KtuenR2urg1ZtAzmszI0tq_Z7m66y-ilQo0uAqMTQ7WRX8auJKg56blZg7WB-iHDuYEBzO6NP0R1IwuYFphQbbTjnTH9NBfs80nym4Zyj8uUvyKbtUyGr5eUz9fNDQ7JCxfJDo9dW1lY9lmj_JNivPbGmf2Pt_lN9tDit9b-WeTetni85Z9pDpVOd7L1E_Vy7egayNO23ZP34eSeLJeux1b0rer_xaZ7ykS78nuSjMY-nL98rparNZNcv07JCjN06_EkTFBxBqOUMACErnELUNMSxTUjLDQZwzcqa4bRjCfeejUEFefS224OLr2S5wxPtij7lVrs80d2CNseRV2P52VNFMBipcdVE-U5jkRD7hFAwpGOylVwU2Mfc9qBh7DoR89yVnWXhgQFHnIsbpVb6tU_B-hH_2yzWY'
      )
      .reply(302, undefined, {
        Location:
          'https://newsletter.slowchinese.net/p/companies-that-eat-people-217',
      })
      .get('/p/companies-that-eat-people-217')
      .reply(200, '')
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    const url = await findNewsletterUrl(html)
    // Not sure if the redirects from substack expire, this test could eventually fail
    expect(url).to.startWith(
      'https://newsletter.slowchinese.net/p/companies-that-eat-people-217'
    )
  })
  it('gets the URL from the header if it is a beehiiv newsletter', async () => {
    nock('https://u23463625.ct.sendgrid.net')
      .head(
        '/ss/c/AX1lEgEQaxtvFxLaVo0GBo_geajNrlI1TGeIcmMViR3pL3fEDZnbbkoeKcaY62QZk0KPFudUiUXc_uMLerV4nA/3k5/3TFZmreTR0qKSCgowABnVg/h30/zzLik7UXd1H_n4oyd5W8Xu639AYQQB2UXz-CsssSnno'
      )
      .reply(302, undefined, {
        Location: 'https://www.milkroad.com/p/talked-guy-spent-30m-beeple',
      })
      .get('/p/talked-guy-spent-30m-beeple')
      .reply(200, '')
    const html = load('./test/utils/data/beehiiv-newsletter.html')
    const url = await findNewsletterUrl(html)
    expect(url).to.startWith(
      'https://www.milkroad.com/p/talked-guy-spent-30m-beeple'
    )
  })
  it('returns undefined if it is not a newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    const url = await findNewsletterUrl(html)
    expect(url).to.be.undefined
  })
})

describe('parseMetadata', async () => {
  it('gets author, title, image, description', async () => {
    const html = load('./test/utils/data/substack-post.html')
    const metadata = await parsePageMetadata(html)
    expect(metadata?.author).to.deep.equal('Omnivore')
    expect(metadata?.title).to.deep.equal('Code Block Syntax Highlighting')
    expect(metadata?.previewImage).to.deep.equal(
      'https://cdn.substack.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2ab1f7e8-2ca7-4011-8ccb-43d0b3bd244f_1490x2020.png'
    )
    expect(metadata?.description).to.deep.equal(
      'Highlighted <code> in Omnivore'
    )
  })
})

describe('parsePreparedContent', async () => {
  it('gets published date when JSONLD fails to load', async () => {
    const html = load('./test/utils/data/stratechery-blog-post.html')
    const result = await parsePreparedContent('https://example.com/', {
      document: html,
      pageInfo: {},
    })
    expect(result.parsedContent?.publishedDate?.getTime()).to.equal(
      new Date('2016-04-05T15:27:51+00:00').getTime()
    )
  })
})

describe('parsePreparedContent', async () => {
  nock('https://oembeddata').get('/').reply(200, {
    version: '1.0',
    provider_name: 'Hippocratic Adventures',
    provider_url: 'https://www.hippocraticadventures.com',
    title:
      'The Ultimate Guide to Practicing Medicine in Singapore &#8211; Part 2',
  })

  it('gets metadata from external JSONLD if available', async () => {
    const html = `<html>
                    <head>
                    <link rel="alternate" type="application/json+oembed" href="https://oembeddata">
                    </link
                    </head>
                    <body>body</body>
                    </html>`
    const result = await parsePreparedContent('https://example.com/', {
      document: html,
      pageInfo: {},
    })
    expect(result.parsedContent?.title).to.equal(
      'The Ultimate Guide to Practicing Medicine in Singapore – Part 2'
    )
  })
})
