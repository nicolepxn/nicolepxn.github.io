const shuffle = array => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)

        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = (selectors, state) => {
    const dimensions = selectors.board.getAttribute('data-dimension')
    var col = 4
    var width = 140
    var height = 210

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    if (dimensions == 8) {
        col = 4
        width = 100
        height = 150
    } else if (dimensions == 10) {
        col = 5
        width = 100
        height = 150
    }

    const emojis = ['obj1.jpg', 'obj2.jpg', 'obj3.jpg', 'obj4.jpg', 'obj5.jpg', 'obj6.jpg', 'obj7.jpg', 'obj8.jpg', 'obj9.jpg', 'obj10.jpg']
    const picks = pickRandom(emojis, dimensions)
    const items = shuffle([...picks, ...picks])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${col}, auto)">
            ${items.map(item => `
                <div class="card" id=${item} style="width: ${width}px; height: ${height}px;">
                    <div class="card-front"></div>

                    <div class="card-back"> <img src="images/${item}" width="100%" height="100%" alt=""></div>
                </div>
            `).join('')}
       </div>
    `

    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = (selectors, state) => {
    state.gameStarted = true
    selectors.restart.classList.remove('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `moves: ${state.totalFlips}`
        selectors.timer.innerText = `time: ${state.totalTime} sec`
    }, 1000)
}

const restartGame = (selectors, state) => {
    state.loop = null
    const dimensions = selectors.board.getAttribute('data-dimension')
    document.removeEventListener("click", clickCardListener)
    openGamePage(dimensions)
}


const flipBackCards = (selectors, state) => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}

const flipCard = (card, selectors, state) => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame(selectors, state)
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.card.flipped:not(.matched)')

        if (flippedCards[0].id === flippedCards[1].id) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        setTimeout(() => {
            flipBackCards(selectors, state)
        }, 500)
    }


    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                    <p><a href="#" onClick="resultPage()" class="href-next">next</a></p>
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = (selectors, state) => {
    document.addEventListener('click', clickCardListener = event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped') && !eventParent.className.includes('board')) {
            flipCard(eventParent, selectors, state)
        } else if (eventTarget.nodeName === 'BUTTON') {
            restartGame(selectors, state)
        }
    })
}

const openGamePage = (level) => {
    document.body.innerHTML = `
        <a href="#">
            <img src="images/back-button.png" onClick="backLevelPage()" class="back-button" alt="">
        </a>
        <div class="game">
            <div class="controls">
                <button class="disabled">restart</button>
                <div class="stats">
                    <div class="moves">moves: 0</div>
                </div>
                <div class="stats">
                    <div class="timer">time: 0 sec</div>
                </div>
            </div>
            <div class="board-container">
                <div class="board" data-dimension="${level}"></div>
                <div class="win">You won!</div>
            </div>
        </div>
    `

    const selectors = {
        boardContainer: document.querySelector('.board-container'),
        board: document.querySelector('.board'),
        moves: document.querySelector('.moves'),
        timer: document.querySelector('.timer'),
        restart: document.querySelector('button'),
        win: document.querySelector('.win')
    }

    const state = {
        gameStarted: false,
        flippedCards: 0,
        totalFlips: 0,
        totalTime: 0,
        loop: null
    }

    generateGame(selectors, state)
    attachEventListeners(selectors, state)
}


const resultPage = () => {
    document.removeEventListener("click", clickCardListener)
    document.body.innerHTML = `
    <a href="index.html">
        <img src="images/menu-button.png" class="back-button" alt="">
    </a>
    <div class="div-header">
        <table>
            <tr>
                  <td><p class="header"> congratulations! <br> you finished the game <br><br> enter your dicord id*</p></td>
            </tr>
            <tr>
        </table>
    </div>
    <div class="button-container">
        <input type="text" class="text-discord" size="50"> <br>
        <a href="index.html">
            <img src="images/send.png" width="280" height="157" alt="">
        </a>
    </div>
    `
}

const backLevelPage = () => {
    document.removeEventListener("click", clickCardListener)
    selectLevelPage()
}

const selectLevelPage = () => {
    document.body.innerHTML = `
    <a href="index.html">
        <img src="images/back-button.png" class="back-button" alt="">
    </a>
    <div class="div-header">
        <p class="header">select a level</p>
    </div>
    <div class="button-container">
        <img src="images/4cards.png" onclick="openGamePage(4)" class="levels" width="350" height="200" alt="">
    
            <img src="images/6cards.png" onclick="openGamePage(6)" class="levels" width="350" height="200" alt=""> <br>
    
    
        <img src="images/8cards.png" onclick="openGamePage(8)" class="levels" width="350" height="200" alt="">
    
    
        <img src="images/10cards.png" onclick="openGamePage(10)" class="levels" width="350" height="200" alt="">
    </div>
    `
}