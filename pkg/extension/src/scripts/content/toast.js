/* global ENV_EXTENSION_ORIGIN */
;('use strict')
;(function () {
  let currentToastEl
  let labels = []
  let ctx = undefined
  let doNotHide = false
  let hideToastTimeout = undefined

  const systemIcons = {
    spinner: `
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5835 17.7729C14.5541 17.7729 18.5835 13.9674 18.5835 9.27295C18.5835 4.57853 14.5541 0.772949 9.5835 0.772949C4.61293 0.772949 0.583496 4.57853 0.583496 9.27295C0.583496 13.9674 4.61293 17.7729 9.5835 17.7729ZM9.5835 16.3563C13.7256 16.3563 17.0835 13.185 17.0835 9.27295C17.0835 5.36093 13.7256 2.18962 9.5835 2.18962C5.44136 2.18962 2.0835 5.36093 2.0835 9.27295C2.0835 13.185 5.44136 16.3563 9.5835 16.3563Z" fill="url(#paint0_angular_980_6213)"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.6697 7.57353C18.0805 7.52347 18.4565 7.79742 18.5095 8.1854C18.5588 8.54608 18.5835 8.90937 18.5835 9.27303C18.5835 9.66424 18.2477 9.98137 17.8335 9.98137C17.4193 9.98137 17.0835 9.66424 17.0835 9.27303C17.0835 8.96998 17.0629 8.66724 17.0219 8.36667C16.9689 7.97869 17.2589 7.62359 17.6697 7.57353Z" fill="#FFD234"/>
    <defs>
    <radialGradient id="paint0_angular_980_6213" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.5835 9.27295) scale(9 8.5)">
    <stop stop-color="#FFD234"/>
    <stop offset="0.0001" stop-color="white"/>
    <stop offset="1" stop-color="#FFD234"/>
    </radialGradient>
    </defs>
      `,
    success: `
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.91626 18.6047C14.8868 18.6047 18.9163 14.5752 18.9163 9.60468C18.9163 4.63411 14.8868 0.604675 9.91626 0.604675C4.9457 0.604675 0.91626 4.63411 0.91626 9.60468C0.91626 14.5752 4.9457 18.6047 9.91626 18.6047ZM9.91626 17.1046C14.0584 17.1046 17.4163 13.7468 17.4163 9.60463C17.4163 5.4625 14.0584 2.10463 9.91626 2.10463C5.77412 2.10463 2.41626 5.4625 2.41626 9.60463C2.41626 13.7468 5.77412 17.1046 9.91626 17.1046Z" fill="#32D74B"/>
        <path d="M13.3538 7.28851L8.7704 11.9209L6.47876 9.60469" stroke="#32D74B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    failure: `
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.74048 18.5508C14.711 18.5508 18.7405 14.5213 18.7405 9.55078C18.7405 4.58022 14.711 0.550781 9.74048 0.550781C4.76992 0.550781 0.740479 4.58022 0.740479 9.55078C0.740479 14.5213 4.76992 18.5508 9.74048 18.5508ZM9.74048 17.0507C13.8826 17.0507 17.2405 13.6929 17.2405 9.55074C17.2405 5.4086 13.8826 2.05074 9.74048 2.05074C5.59834 2.05074 2.24048 5.4086 2.24048 9.55074C2.24048 13.6929 5.59834 17.0507 9.74048 17.0507Z" fill="#C7372F"/>
        <path d="M12.794 11.897L12.794 11.897L10.4474 9.55078L12.794 7.2046L12.794 7.20459C12.8878 7.11079 12.9405 6.98358 12.9405 6.85093C12.9405 6.71828 12.8878 6.59107 12.794 6.49727C12.7002 6.40348 12.573 6.35078 12.4403 6.35078C12.3077 6.35078 12.1805 6.40348 12.0867 6.49727L12.0867 6.49728L9.74048 8.84382L7.3943 6.49728L7.39429 6.49727C7.30049 6.40348 7.17328 6.35078 7.04063 6.35078C6.90798 6.35078 6.78077 6.40348 6.68697 6.49727C6.59317 6.59107 6.54048 6.71828 6.54048 6.85093C6.54048 6.98358 6.59317 7.11079 6.68697 7.20459L6.68698 7.2046L9.03351 9.55078L6.68698 11.897L6.68697 11.897C6.59317 11.9908 6.54048 12.118 6.54048 12.2506C6.54048 12.3833 6.59317 12.5105 6.68697 12.6043C6.78077 12.6981 6.90798 12.7508 7.04063 12.7508C7.17328 12.7508 7.30049 12.6981 7.39429 12.6043L7.3943 12.6043L9.74048 10.2577L12.0867 12.6043L12.0867 12.6043C12.1331 12.6507 12.1882 12.6876 12.2489 12.7127C12.3096 12.7378 12.3746 12.7508 12.4403 12.7508C12.506 12.7508 12.571 12.7378 12.6317 12.7127C12.6924 12.6876 12.7475 12.6507 12.794 12.6043C12.8404 12.5578 12.8773 12.5027 12.9024 12.442C12.9275 12.3814 12.9405 12.3163 12.9405 12.2506C12.9405 12.1849 12.9275 12.1199 12.9024 12.0592C12.8773 11.9986 12.8404 11.9434 12.794 11.897Z" fill="#C7372F" stroke="#C7372F" stroke-width="0.4"/>
      </svg>`,
    close:
      '<path d="M3.646 3.646a.5.5 0 0 1 .708 0L8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 0 1 0-.708z"/>',
    animatedLoader: `
    <style>
    .loading-spinner {  
      /*  control spinner size with setting font-size  */
      font-size: 3rem;
      border: 2px solid #FFD234;
      border-top-color: transparent;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      animation: loading-spinner 1.5s linear infinite;
      margin: 0 auto;
      box-sizing: border-box;
    }
    
    @keyframes loading-spinner {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }    
    </style>
    <div class="loading-spinner"></div>
    `,
  }

  async function createToastContainer() {
    const file = await fetch(browserApi.runtime.getURL('views/toast.html'))
    const html = await file.text()

    const root = document.createElement('div')
    root.tabIndex = 0
    root.attachShadow({ mode: 'open' })
    if (root.shadowRoot) {
      root.shadowRoot.innerHTML = `<style>:host {all initial;}</style>`
    }

    const toastEl = document.createElement('div')
    toastEl.id = '#omnivore-toast'
    toastEl.innerHTML = html
    toastEl.tabIndex = 0
    root.shadowRoot.appendChild(toastEl)

    document.body.appendChild(root)
    connectButtons(root)
    connectKeyboard(root)

    return root
  }

  function displayLoggedOutView() {
    cancelAutoDismiss()
    updatePageStatus('failure')
    toggleRow('#omnivore-logged-out-row')
    updateStatusBox(
      '#omnivore-logged-out-status',
      'empty',
      `You are not logged in.`
    )
    disableAllButtons()
  }

  function disableAllButtons() {
    const actionButtons = [
      '#omnivore-toast-edit-title-btn',
      '#omnivore-toast-edit-labels-btn',
      '#omnivore-toast-read-now-btn',
      '#omnivore-toast-add-note-btn',
      '#omnivore-open-menu-btn',
    ]
    actionButtons.forEach((btnId) => {
      const btn = currentToastEl.shadowRoot.querySelector(btnId)
      btn.disabled = true
    })
  }

  function cancelAutoDismiss() {
    doNotHide = true
    if (hideToastTimeout) clearTimeout(hideToastTimeout)
  }

  function updateStatus(payload) {
    if (!currentToastEl) {
      console.log('no statusBox to update')
      return
    }

    if (payload.ctx) {
      ctx = { ...ctx, ...payload.ctx }
    }

    switch (payload.target) {
      case 'logged_out':
        displayLoggedOutView()
        break
      case 'page':
        updatePageStatus(payload.status)
        break
      case 'note':
        updateStatusBox(
          '#omnivore-add-note-status',
          payload.status,
          payload.message,
          payload.status == 'success' ? 2500 : undefined
        )
        if (payload.status == 'success') {
          setTimeout(() => {
            toggleRow('#omnivore-add-note-status')
          }, 3000)
        }
        break
      case 'title':
        updateStatusBox(
          '#omnivore-edit-title-status',
          payload.status,
          payload.message,
          payload.status == 'success' ? 2500 : undefined
        )
        if (payload.status == 'success') {
          setTimeout(() => {
            toggleRow('#omnivore-edit-title-status')
          }, 3000)
        }
        break
      case 'labels':
        updateStatusBox(
          '#omnivore-edit-labels-status',
          payload.status,
          payload.message,
          payload.status == 'success' ? 2500 : undefined
        )
        break
      case 'extra':
        updateStatusBox(
          '#omnivore-extra-status',
          payload.status,
          payload.message,
          payload.status == 'success' ? 2500 : undefined
        )
        if (payload.status == 'success') {
          setTimeout(() => {
            currentToastEl.remove()
          }, 3000)
        }
        break
    }
  }

  function showToolbar(payload) {
    ctx = payload.ctx

    showToolbarAsync(payload).catch((err) =>
      console.log('error showing toast', err)
    )
  }

  function updateLabelsFromCache(payload) {
    ;(async () => {
      await getStorageItem('labels').then((cachedLabels) => {
        labels = cachedLabels
        console.log(' == updated labels', cachedLabels)
      })
    })()
  }

  async function showToolbarAsync(payload) {
    const bodyEl = document.body
    if (!bodyEl) return

    if (!currentToastEl) {
      currentToastEl = await createToastContainer()
    }

    if (payload.type === 'loading') {
      updateStatus({
        status: 'loading',
        target: 'page',
      })
    }

    document.querySelectorAll('#omnivore-toast').forEach((toastEl) => {
      if (toastEl !== currentToastEl) {
        console.log('removing current toast el: ', currentToastEl)
        toastEl.remove()
      }
    })

    currentToastEl.focus({
      preventScroll: true,
    })
  }

  function updatePageStatus(status) {
    const statusBox = currentToastEl.shadowRoot.querySelector(
      '.omnivore-toast-statusBox'
    )
    switch (status) {
      case 'loading':
        statusBox.innerHTML = systemIcons.animatedLoader
        break
      case 'success':
        // Auto hide if everything went well and the user
        // has not initiated any interaction.
        hideToastTimeout = setTimeout(function () {
          console.log('hiding: ', currentToastEl, doNotHide)
          if (!doNotHide) {
            currentToastEl.remove()
            currentToastEl = undefined
          }
        }, 2500)
        statusBox.innerHTML = systemIcons.success
        break
      case 'failure':
        statusBox.innerHTML = systemIcons.failure
    }
  }

  function updateStatusBox(boxId, state, message, dismissAfter) {
    const statusBox = currentToastEl.shadowRoot.querySelector(boxId)
    const image = (() => {
      switch (state) {
        case 'loading':
          return systemIcons.animatedLoader
        case 'success':
          return systemIcons.success
        case 'failure':
          return systemIcons.failure
        case 'none':
          return ''
        default:
          return undefined
      }
    })()
    if (image) {
      statusBox.innerHTML = `<span style='padding-right: 10px'>${image}</span><span style='line-height: 20px'>${message}</span>`
    } else {
      statusBox.innerHTML = message
    }
    if (dismissAfter) {
      setTimeout(() => {
        statusBox.innerHTML = ''
      }, dismissAfter)
    }
  }

  function toggleRow(rowId) {
    console.log('currentToastEl: ', currentToastEl)
    const container = currentToastEl.shadowRoot.querySelector(rowId)
    const initialState = container?.getAttribute('data-state')
    const rows = currentToastEl.shadowRoot.querySelectorAll(
      '.omnivore-toast-func-row'
    )

    rows.forEach((r) => {
      r.setAttribute('data-state', 'closed')
    })

    if (container && initialState) {
      const newState = initialState === 'open' ? 'closed' : 'open'
      container.setAttribute('data-state', newState)
    }
  }

  function connectButtons(root) {
    const btns = [
      { id: '#omnivore-toast-add-note-btn', func: addNote },
      { id: '#omnivore-toast-edit-title-btn', func: editTitle },
      { id: '#omnivore-toast-edit-labels-btn', func: editLabels },
      { id: '#omnivore-toast-read-now-btn', func: readNow },
      { id: '#omnivore-open-menu-btn', func: openMenu },
      { id: '#omnivore-toast-close-btn', func: closeToast },
      { id: '#omnivore-toast-login-btn', func: login },
      { id: '#omnivore-toast-archive-btn', func: archive },
      { id: '#omnivore-toast-delete-btn', func: deleteItem },
    ]

    for (const btnInfo of btns) {
      const btn = root.shadowRoot.querySelector(btnInfo.id)
      if (btn) {
        btn.addEventListener('click', btnInfo.func)
      }
    }

    var x = window.matchMedia('(max-width: 500px)')
    if (x.matches) {
      const labels = root.shadowRoot.querySelectorAll(
        '.omnivore-top-button-label'
      )
      labels.forEach((label) => {
        label.style.display = 'none'
      })
      const container = root.shadowRoot.querySelector(
        '#omnivore-toast-container'
      )
      container.style.width = '280px'
      container.style.top = 'unset'
      container.style.bottom = '20px'
    }
  }

  function connectKeyboard(root) {
    root.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'r':
          readNow()
          break
        case 'l':
          editLabels()
          break
        case 'm':
          openMenu()
          break
        case 't':
          editTitle()
          break
        case 'n':
          e.preventDefault()
          addNote()
          break
      }

      e.cancelBubble = true
      if (e.stopPropogation) {
        e.stopPropogation()
      }
    })
  }

  function createLabelRow(label, idx) {
    const element = document.createElement('button')
    const dot = document.createElement('span')
    dot.style = 'width:10px;height:10px;border-radius:1000px;'
    dot.style.setProperty('background-color', label.color)
    const title = document.createElement('span')
    title.style = 'margin-left: 10px;pointer-events: none;'
    title.innerText = label.name

    const check = document.createElement('span')
    check.style = 'margin-left: auto;pointer-events: none;'
    check.className = 'checkbox'
    check.innerHTML = `
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.7411 1.75864L4.79692 10.7028L0.69751 6.60341L1.74845 5.55246L4.79692 8.59348L12.6902 0.707703L13.7411 1.75864Z" fill="#888888"/>
      </svg>
    `

    element.appendChild(dot)
    element.appendChild(title)
    element.appendChild(check)

    element.onclick = labelClick
    element.onkeydown = labelKeyDown
    element.setAttribute('data-label-id', label.id)
    element.setAttribute('data-label-idx', idx)
    element.setAttribute(
      'data-label-selected',
      label['selected'] ? 'on' : 'off'
    )
    element.setAttribute('tabIndex', '-1')

    return element
  }

  function labelClick(event) {
    event.preventDefault()

    const labelId = event.target.getAttribute('data-label-id')

    toggleLabel(event, labelId)
  }

  function toggleLabel(event, labelId) {
    const labelSelected = event.target.getAttribute('data-label-selected')

    if (!labelId || !labelSelected) {
      return
    }

    const toggledValue = labelSelected == 'on' ? false : true
    event.target.setAttribute(
      'data-label-selected',
      toggledValue ? 'on' : 'off'
    )

    const label = labels.find((l) => l.id === labelId)
    if (label) {
      label.selected = toggledValue
    }
  }

  function labelKeyDown(event) {
    event.cancelBubble = true
    if (event.stopPropogation) {
      event.stopPropogation()
    }

    switch (event.key.toLowerCase()) {
      case 'arrowup': {
        if (
          event.target ==
          event.target.form.querySelector('#omnivore-edit-label-text')
        ) {
          return
        }

        const idx = event.target.getAttribute('data-label-idx')
        let prevIdx = idx && Number(idx) != NaN ? Number(idx) - 1 : 0
        if (
          event.target ==
          event.target.form.querySelector('#omnivore-save-button')
        ) {
          // Focus the last label index
          const maxItemIdx = Math.max(
            ...Array.from(
              event.target.form.querySelectorAll(`button[data-label-idx]`)
            ).map((b) => Number(b.getAttribute('data-label-idx')))
          )
          if (maxItemIdx != NaN) {
            prevIdx = maxItemIdx
          }
        }

        const prev = event.target.form.querySelector(
          `button[data-label-idx='${prevIdx}']`
        )
        if (prev) {
          prev.focus()
        } else {
          // Focus the text area
          event.target.form.querySelector('#omnivore-edit-label-text')?.focus()
        }
        event.preventDefault()
        break
      }
      case 'arrowdown': {
        const idx = event.target.getAttribute('data-label-idx')
        const nextIdx = idx && Number(idx) != NaN ? Number(idx) + 1 : 0
        const next = event.target.form.querySelector(
          `button[data-label-idx='${nextIdx}']`
        )
        if (next) {
          next.focus()
        } else {
          // Focus the save button
          event.target.form.querySelector('.omnivore-save-button')?.focus()
        }
        event.preventDefault()
        break
      }
      case 'enter': {
        const labelId = event.target.getAttribute('data-label-id')
        toggleLabel(event, labelId)
        event.preventDefault()
        break
      }
    }
  }

  function addNote() {
    cancelAutoDismiss()
    toggleRow('#omnivore-add-note-row')

    const noteArea = currentToastEl.shadowRoot.querySelector(
      '#omnivore-add-note-textarea'
    )

    if (noteArea) {
      noteArea.focus()

      noteArea.onkeydown = (e) => {
        e.cancelBubble = true
        if (e.stopPropogation) {
          e.stopPropogation()
        }
        // Handle the enter key
        if (e.keyCode == 13 && (e.metaKey || e.ctrlKey)) {
          updateStatusBox(
            '#omnivore-add-note-status',
            'loading',
            'Adding note...'
          )

          browserApi.runtime.sendMessage({
            action: ACTIONS.AddNote,
            payload: {
              ctx: ctx,
              note: noteArea.value,
            },
          })
        }
      }
    }

    currentToastEl.shadowRoot.querySelector(
      '#omnivore-add-note-form'
    ).onsubmit = (event) => {
      console.log('submitting form: ', event)
      updateStatusBox('#omnivore-add-note-status', 'loading', 'Adding note...')

      browserApi.runtime.sendMessage({
        action: ACTIONS.AddNote,
        payload: {
          ctx: ctx,
          note: event.target.elements.title.value,
        },
      })

      event.preventDefault()
      event.stopPropogation()
    }
  }

  function editTitle() {
    cancelAutoDismiss()
    toggleRow('#omnivore-edit-title-row')

    const titleArea = currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-title-textarea'
    )

    if (titleArea) {
      titleArea.focus()

      titleArea.onkeydown = (e) => {
        e.cancelBubble = true
        if (e.stopPropogation) {
          e.stopPropogation()
        }
      }
    }

    currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-title-form'
    ).onsubmit = (event) => {
      updateStatusBox(
        '#omnivore-edit-title-status',
        'loading',
        'Updating title...'
      )

      browserApi.runtime.sendMessage({
        action: ACTIONS.EditTitle,
        payload: {
          ctx: ctx,
          title: event.target.elements.title.value,
        },
      })

      event.preventDefault()
    }
  }

  async function editLabels() {
    cancelAutoDismiss()

    await getStorageItem('labels').then((cachedLabels) => {
      labels = cachedLabels
    })

    toggleRow('#omnivore-edit-labels-row')
    currentToastEl.shadowRoot
      .querySelector('#omnivore-edit-label-text')
      ?.focus()
    const list = currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-labels-list'
    )
    currentToastEl.shadowRoot
      .querySelector('#omnivore-edit-label-text')
      .addEventListener('input', function () {
        updateLabels(this.value)
      })

    currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-label-text'
    ).onkeydown = labelKeyDown

    if (list) {
      list.innerHTML = ''
      labels.forEach(function (label, idx) {
        const rowHtml = createLabelRow(label, idx)
        list.appendChild(rowHtml)
      })
    }

    currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-labels-form'
    ).onsubmit = (event) => {
      event.preventDefault()
      const statusBox = currentToastEl.shadowRoot.querySelector(
        '#omnivore-edit-labels-status'
      )
      statusBox.innerText = 'Updating labels...'
      const labelIds = labels.filter((l) => l['selected']).map((l) => l.id)

      browserApi.runtime.sendMessage({
        action: ACTIONS.SetLabels,
        payload: {
          ctx: ctx,
          labelIds: labelIds,
        },
      })
    }
  }

  async function updateLabels(filterValue) {
    const list = currentToastEl.shadowRoot.querySelector(
      '#omnivore-edit-labels-list'
    )
    if (list) {
      list.innerHTML = ''
      if (filterValue) {
        labels
          .filter(
            (l) => l.name.toLowerCase().indexOf(filterValue.toLowerCase()) > -1
          )
          .forEach(function (label, idx) {
            const rowHtml = createLabelRow(label, idx)
            list.appendChild(rowHtml)
          })
      } else {
        labels.forEach(function (label, idx) {
          const rowHtml = createLabelRow(label, idx)
          list.appendChild(rowHtml)
        })
      }
    }
  }

  function readNow() {
    cancelAutoDismiss()
    const container = currentToastEl.shadowRoot.querySelector(
      '#omnivore-toast-container'
    )
    container.setAttribute('data-state', 'open')

    if (ctx && ctx.readerURL) {
      window.open(ctx.readerURL, '_blank')
    } else if (ctx) {
      window.open(
        new URL(`/article?url=${encodeURI(ctx.originalURL)}`, ctx.omnivoreURL),
        '_blank'
      )
    } else {
      alert('Error no URL found.')
    }

    setTimeout(() => {
      closeToast()
    }, 1000)
  }

  function archive(event) {
    browserApi.runtime.sendMessage({
      action: ACTIONS.Archive,
      payload: {
        ctx: ctx,
      },
    })

    event.preventDefault()
  }

  function deleteItem(event) {
    browserApi.runtime.sendMessage({
      action: ACTIONS.Delete,
      payload: {
        ctx: ctx,
      },
    })

    event.preventDefault()
  }

  function openMenu() {
    cancelAutoDismiss()
    toggleRow('#omnivore-extra-buttons-row')
  }

  function closeToast() {
    currentToastEl.remove()
    currentToastEl = undefined
  }

  function login() {
    window.open(new URL(`/login`, ctx.omnivoreURL), '_blank')
    setTimeout(closeToast, 2000)
  }

  window.showToolbar = showToolbar
  window.updateStatus = updateStatus
  window.updateLabelsFromCache = updateLabelsFromCache
})()
