const app = (()=>{
  const root = document.getElementById('questionArea')
  const progressBar = document.getElementById('progressBar')
  const stepText = document.getElementById('stepText')
  const backBtn = document.getElementById('backBtn')
  const nextBtn = document.getElementById('nextBtn')

  const suggestions = ['Tomoca Coffee','Kaldi\'s','Local Juice House','Java House']

  const qs = [
    {id:'year',type:'single',q:'What year are you studying?',am:'የትኛው ዓመት ነዎት? ',options:['1st year','2nd year','3rd year','4th year','Graduate']},
    {id:'living',type:'single',q:'Where do you live?',am:'የት እንደምትኖሩ?',options:['On-campus','Off-campus']},
    {id:'freq',type:'single',q:'How often do you go outside campus per week?',am:'እባክዎ በሳምንት ስንት ጊዜ እየወጡ ነው? ',options:['Never','1-2 times','3-4 times','5+ times']},
    {id:'where',type:'multi',q:'Where do you usually go? (pick any)',am:'የተለመዱት የምትሄዱበት ቦታ የት ነው? ',options:['Cafés','Restaurants','Juice houses','Shops','Entertainment','Libraries','Other']},
    {id:'reason',type:'single',q:'What is the main reason you go out?',am:'ዋናው ምክንያት ምንድን ነው? ',options:['Food/Drink','Study/Group work','Socializing','Shopping','Entertainment','Other']},
    {id:'spend',type:'composite',q:'How much do you usually spend per visit?',am:'በእያንዳንዱ ጉብኝት እስከምን ያክላሉ? '},
    {id:'business',type:'business',q:'Which place do you visit the MOST?',am:'የብዙ ጊዜ የምትጎብኙት ቦታ የት ነው? '},
  ]

  let i = 0
  const answers = {}

  function render(){
    const item = qs[i]
    stepText.textContent = `Step ${i+1} of ${qs.length+1}`
    progressBar.style.width = `${Math.round(((i)/(qs.length+1))*100)}%`
    root.innerHTML = ''

    if(!item){
      return showFinal()
    }

    const wrap = document.createElement('div')
    wrap.className = 'question enter'

    const h = document.createElement('h2')
    h.textContent = item.q
    const am = document.createElement('div')
    am.className = 'amharic'
    am.textContent = item.am
    wrap.appendChild(h)
    wrap.appendChild(am)

    if(item.type==='single'){
      const opts = document.createElement('div')
      opts.className = 'options'
      item.options.forEach(opt=>{
        const b = document.createElement('button')
        b.className='option-button'
        b.textContent=opt
        b.addEventListener('click',()=>{answers[item.id]=opt; next();})
        opts.appendChild(b)
      })
      wrap.appendChild(opts)
    }

    if(item.type==='multi'){
      const opts = document.createElement('div')
      opts.className='options'
      const selected = new Set(answers[item.id]||[])
      item.options.forEach(opt=>{
        const b = document.createElement('button')
        b.className='option-button'+(selected.has(opt)?' selected':'')
        b.textContent=opt
        b.addEventListener('click',()=>{
          if(selected.has(opt)){selected.delete(opt); b.classList.remove('selected')}
          else{selected.add(opt); b.classList.add('selected')}
          answers[item.id]=Array.from(selected)
        })
        opts.appendChild(b)
      })
      wrap.appendChild(opts)
      const note = document.createElement('div')
      note.className='small-note'
      note.textContent='Tap to select multiple. Then press Next.'
      wrap.appendChild(note)
    }

    if(item.type==='composite'){
      // spend per visit: choices + slider optional + weekly optional
      const grid = document.createElement('div')
      grid.className='options'
      ['< $1','$1 - $3','$3 - $6','> $6'].forEach(range=>{
        const b=document.createElement('button')
        b.className='option-button'
        b.textContent=range
        b.addEventListener('click',()=>{answers['spend_per_visit']=range; next();})
        grid.appendChild(b)
      })
      wrap.appendChild(grid)
      const sliderWrap=document.createElement('div')
      sliderWrap.style.marginTop='14px'
      const sliderLabel=document.createElement('div')
      sliderLabel.className='small-note'
      sliderLabel.textContent='Or drag to pick an approximate amount (optional)'
      const slider=document.createElement('input')
      slider.type='range';slider.min=0;slider.max=100;slider.value=20;slider.className='slider'
      slider.addEventListener('input',()=>{answers['spend_slider']=slider.value; sliderLabel.textContent=`~ ${slider.value} ETB per visit (optional)`})
      sliderWrap.appendChild(sliderLabel)
      sliderWrap.appendChild(slider)
      wrap.appendChild(sliderWrap)

      const weekly = document.createElement('input')
      weekly.className='input'
      weekly.placeholder='Weekly total spending (optional)'
      weekly.type='number'
      weekly.addEventListener('input',()=>answers['weekly_total']=weekly.value)
      wrap.appendChild(weekly)
    }

    if(item.type==='business'){
      const chips=document.createElement('div')
      chips.className='chips'
      suggestions.forEach(s=>{
        const c=document.createElement('div')
        c.className='chip'
        c.textContent=s
        c.addEventListener('click',()=>{
          // clear previous selection visuals
          chips.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'))
          c.classList.add('selected')
          answers['business_name']=s
        })
        chips.appendChild(c)
      })
      const addOwn=document.createElement('div')
      addOwn.style.marginTop='12px'
      const input=document.createElement('input')
      input.className='input'
      input.placeholder="e.g. Tomoca Coffee, Kaldi's, Local Juice House"
      input.addEventListener('input',()=>{answers['business_name']=input.value})
      addOwn.appendChild(input)
      wrap.appendChild(chips)
      wrap.appendChild(addOwn)

      // follow-up frequency
      const follow=document.createElement('div')
      follow.style.marginTop='14px'
      const fLabel=document.createElement('div');fLabel.className='small-note';fLabel.textContent='How often do you go there?'
      follow.appendChild(fLabel)
      ['Daily','Weekly','Occasionally'].forEach(opt=>{
        const b=document.createElement('button')
        b.className='option-button'
        b.style.marginTop='8px'
        b.textContent=opt
        b.addEventListener('click',()=>{answers['business_freq']=opt; next();})
        follow.appendChild(b)
      })
      wrap.appendChild(follow)
    }

    // Other-specific behavior: show text input only when selecting Other
    if(item.type==='multi'){
      // watch for Other in answers
      const otherInput = document.createElement('input')
      otherInput.className='input'
      otherInput.placeholder='If Other, tell us which (optional)'
      otherInput.style.display='none'
      otherInput.addEventListener('input',()=>answers['where_other']=otherInput.value)
      wrap.appendChild(otherInput)
      // toggle display when 'Other' selected
      wrap.addEventListener('click',()=>{
        const sel = answers[item.id]||[]
        if(sel.includes('Other')) otherInput.style.display='block'
        else otherInput.style.display='none'
      })
    }

    root.appendChild(wrap)
    updateControls()
  }

  function updateControls(){
    backBtn.style.visibility = i===0 ? 'hidden' : 'visible'
    // For multi-select require explicit click on Next; for others Next can be optional
    const cur = qs[i]
    if(!cur){ nextBtn.textContent='Finish'; return }
    nextBtn.textContent = cur.type==='multi' ? 'Next' : 'Skip'
  }

  function next(){ i++ ; render() }
  function back(){ if(i>0){i--; render()} }

  function showFinal(){
    progressBar.style.width='100%'
    stepText.textContent='Complete'
    root.innerHTML = ''
    const wrap=document.createElement('div');wrap.className='question enter'
    const h = document.createElement('h2'); h.textContent='🎉 You\'re done! Thanks for helping improve student life.'
    const am = document.createElement('div'); am.className='amharic'; am.textContent='እስራሕ! አመሰግናለን — ለተማሪዎ ሕይወት ለማሻሻል ተማሪ ግምገማዎ ጠቃሚ ነው።'
    const note=document.createElement('div');note.className='small-note';note.textContent='We use this data to bring better student discounts 👀'
    wrap.appendChild(h);wrap.appendChild(am);wrap.appendChild(note)
    const debug=document.createElement('pre');debug.style.marginTop='12px';debug.style.fontSize='13px';debug.textContent=JSON.stringify(answers,null,2)
    wrap.appendChild(debug)
    root.appendChild(wrap)
    console.log('Survey results:',answers)
    // mark todo done via UI (left for developer)
  }

  backBtn.addEventListener('click',back)
  nextBtn.addEventListener('click',()=>{
    const cur = qs[i]
    if(!cur){ showFinal(); return }
    if(cur.type==='multi'){
      // must have at least one
      const sel = answers[cur.id]||[]
      if(!sel.length){ alert('Please select at least one option'); return }
    }
    i++; render()
  })

  // microcopy start screen
  function intro(){
    root.innerHTML=''
    const w = document.createElement('div'); w.className='question enter'
    const h = document.createElement('h2'); h.textContent='Takes only 30 seconds ⏱'
    const am = document.createElement('div'); am.className='amharic'; am.textContent='ብዙ ጊዜ አይወስድም — የ30 ሰከንድ ጥያቄዎች'
    const p = document.createElement('div'); p.className='small-note'; p.textContent='Almost done 👀 — quick and anonymous.'
    const start = document.createElement('button'); start.className='btn primary'; start.style.marginTop='16px'; start.textContent='Start Survey'
    start.addEventListener('click',()=>{render()})
    w.appendChild(h);w.appendChild(am);w.appendChild(p);w.appendChild(start)
    root.appendChild(w)
    backBtn.style.visibility='hidden'
    progressBar.style.width='4%'
    stepText.textContent='Intro'
  }

  intro()
  return {render}
})()
