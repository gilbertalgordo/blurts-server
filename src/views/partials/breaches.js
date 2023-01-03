import { getMessage, getLocale } from '../../utils/fluent.js'
import AppConstants from '../../app-constants.js'

function createEmailOptions (data) {
  const emails = data.verifiedEmails.map(obj => obj.email)
  const optionElements = emails.map(email => `<option>${email}</option>`)

  return optionElements.join('')
}

function createEmailCTA (count) {
  const total = parseInt(AppConstants.MAX_NUM_ADDRESSES)

  if (count >= total) return '' // don't show CTA if additional emails are not available for monitor

  // TODO: link "add email" flow
  return `<a href='http://mozilla.org'>${getMessage('add-email-link')}</a>`
}

function createBreachRows (data) {
  const locale = getLocale()
  const shortDate = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
  const shortList = new Intl.ListFormat(locale, { style: 'narrow' })
  const longDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
  const longList = new Intl.ListFormat(locale, { style: 'long' })
  const breachRowsHTML = data.verifiedEmails.flatMap(account => {
    return account.breaches.map(breach => {
      const breachDate = Date.parse(breach.BreachDate)
      const addedDate = Date.parse(breach.AddedDate)
      const dataClassesTranslated = breach.DataClasses.map(item => getMessage(item))
      const description = getMessage('breach-description', {
        companyName: breach.Title,
        breachDate: longDate.format(breachDate),
        addedDate: longDate.format(addedDate),
        dataClasses: longList.format(dataClassesTranslated)
      })

      return `
      <details class='breach-row' data-email=${account.email} hidden=${!account.primary}>
        <summary>
          <span>${breach.Title}</span><span>${shortList.format(dataClassesTranslated)}</span><span>${shortDate.format(addedDate)}</span>
        </summary>
        <div>
          ${description}
        </div>
      </details>
      `
    })
  })

  return breachRowsHTML.join('')
}

export const breaches = data => `
<section>
  <header class='breaches-header'>
    <h1>${getMessage('breach-heading-email', { 'email-select': `<custom-select>${createEmailOptions(data.breachesData)}</custom-select>` })}</h1>
    <figure>
      <img src='/images/temp-diagram.png' width='80' height='80'>
      <figcaption class='breach-stats'>
        <strong>10 total breaches</strong>
        <label>Resolved</label>
        <label>Unresolved</label>
      </figcaption>
    </figure>
    <figure class='email-stats'>
      <img src='/images/icon-email.svg' width='55' height='30'>
      <figcaption>
        <strong>${getMessage('emails-monitored', { count: data.emailCount, total: AppConstants.MAX_NUM_ADDRESSES })}</strong>
        ${createEmailCTA(data.emailCount)}
      </figcaption>
    </figure>
  </header>
</section>
<section class='breaches-table'>
  <header>
    <span>${getMessage('column-company')}</span><span>${getMessage('column-breached-data')}</span><span>${getMessage('column-detected')}</span>
  </header>
  ${createBreachRows(data.breachesData)}
</section>
<section style='display:none'>
  <!--This is a temp section/button to test breach update post-->
  <button id="update-breaches">Update Breaches</button>
  <pre>${JSON.stringify(data.breachesData, null, 2)}</pre>
</section>
`
