$(document).ready(function(){    
    var 

    $squareTemplate = $($('#square-template').html()),

    $gameboard = $('#gameboard'),
    $begin = $('#begin'),
    $options = $('#options'),
    $squaresOption = $('#squares-option'),
    $playerOptions = $('#player-option'),
    $menu = $('#menu'),
    $ready = $('#ready'),
    $correct = $('#correct'),
    $incorrect = $('#incorrect'),

    // Booleans.
    animating = false,

    squares = [],
    notes = [],         
    soundTextures = [],
    noteCount = null, 
    computerCount = null,
    computerSquareCount = null,
    texturesCount = null,
    streak = 0,
    matched = null,
    currentId = null,

    randSquareSequence = [],
    randNoteSequence = [],
    randTextureSequence = [],
    playerSequence = [],

    squareColors = ['#f379ad','#7979f3','#79e5f3','#79f396','#ecf379','#f3ad79','#79b8f3','#E30E1F','#824119','#8F2929','#7B8F29','#E3B900'],
    numSquares = 0,
    numPlayers = null,
    numClicks = null,
    currentPlayer = -1,
    offset = [],
    restart = [];

    offset[4] = 50; offset[6] = 16.6666666666; offset[8] = 11.111111111; offset[12] = 8.3333333333;
    restart[4] = 2; restart[6] = 3; restart[9] = 3; restart[12] = 4;

    var loadAudio = function(){
        for (var i = 0; i < 9; i++) notes.push(new buzz.sound("audio/"+(i+1)+".mp3"));
        for (var i = 0; i < 6; i++) soundTextures.push(new buzz.sound("audio/b"+(i+1)+".mp3"))
    }(),

    setEventListeners = function(){
        $squaresOption.on('click', 'span', function(){
            $squaresOption.find('.selected').removeClass('selected');
            $(this).addClass('selected');
            setTimeout(function(){$squaresOption.find('span').css({
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)'
            });}, 200);
        });

        $begin.on('click', function(){
            $begin.css({
                '-webkit-transform': 'scale(0.9)',
                'transform': 'scale(0.9)'
            });
            setTimeout(function(){$begin.css({
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)'
            });}, 200);
            $options.css('top', '-50%');
            $gameboard.css('background-color', '#FFF');
            $menu.css('top', 0);
            $ready.css('bottom', 0);

            numSquares = $squaresOption.find('.selected').html();
            // numPlayers = $playerOptions.find('.selected').html();

            populateSquares();
            cacheSquares();
            setTimeout(function(){
                initializeSoundVariables();
                initializeConditions();
                resetConditions();
                setGameEventListeners();
            }, numSquares*100);

        });

        $menu.on('click', function(){
            $gameboard.html('');
            currentPlayer = -1;
            squares = [];
            randSquareSequence = [];
            randNoteSequence = [];
            randTextureSequence = [];
            $(this).css({
                '-webkit-transform': 'scale(0.9)',
                'transform': 'scale(0.9)'
            });
            $correct.css({
                'opacity': 0,
                '-webkit-transform': 'scale(1.3)',
                'transform': 'scale(1.3)'
            });
            $incorrect.css({
                'opacity': 0,
                '-webkit-transform': 'scale(1.3)',
                'transform': 'scale(1.3)'
            });
            $ready.css('bottom', '-20%');
            setTimeout(function(){$menu.css({
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)',
                'top': '-20%'
            });}, 200);
            setTimeout(function(){$options.css('top', '30%');}, 300);
        });

        $ready.on('click', function(){
            $(this).css({
                '-webkit-transform': 'scale(0.9)',
                'transform': 'scale(0.9)'
            });
            setTimeout(function(){$ready.css({
                'bottom': '-20%',
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)'
            });}, 200);
            $correct.css({
                '-webkit-transform': 'scale(1.3)',
                'transform': 'scale(1.3)',
                'opacity': 0
            });
            $incorrect.css({
                '-webkit-transform': 'scale(1.3)',
                'transform': 'scale(1.3)',
                'opacity': 0
            });
            $menu.css('top', '-20%');
            promptReady();
        });
    }(),

    initializeSoundVariables = function(){
        noteCount = 0;
        texturesCount = 0;
    },

    initializeConditions = function(){
        for (var i = 0; i < numSquares; i++){
            randSquareSequence.push(i);
        }
        for (var i = 0; i < 9; i++){
            randNoteSequence.push(i);
        }
        for (var i = 0; i < 6; i++){
            randTextureSequence.push(i);
        }
    },

    resetConditions = function(){
        shuffle(randSquareSequence);
        shuffle(randNoteSequence);
        shuffle(randTextureSequence);
    },

    shuffle = function(o){
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    },

    populateSquares = function(){
        for (var i = 0, j = 0; i < numSquares; i++, j++){
            if (j==restart[numSquares]) j = 0;
            if (numSquares == 4){
                $gameboard.append($squareTemplate.clone()
                    .attr({'id': i, 'class': 'square4'})
                    .css({'background-color': squareColors[i], 'left': 50*j+'%'}));
            } else if (numSquares == 6){
                $gameboard.append($squareTemplate.clone()
                    .attr({'id': i, 'class': 'square6'})
                    .css({'background-color': squareColors[i], 'left': 33.3333333333*j+'%'}));
            } else if (numSquares == 9){
                $gameboard.append($squareTemplate.clone()
                    .attr({'id': i, 'class': 'square9'})
                    .css({'background-color': squareColors[i], 'left': 33.333333*j+'%'}));
            } else if (numSquares == 12){
                $gameboard.append($squareTemplate.clone()
                    .attr({'id': i, 'class': 'square12'})
                    .css({'background-color': squareColors[i], 'left': 25*j+'%'}));
            } else alert('error');
        }
    }, 

    cacheSquares = function(){
        for (var i = 0; i < numSquares; i++) squares.push($('#gameboard #'+i));
    },

    animateSquares = function(){
        if (numSquares == 4){
            setTimeout(function(){squares[0].css('top', 0);}, 100);
            setTimeout(function(){squares[1].css('top', 0);}, 200);
            setTimeout(function(){squares[2].css('top', '50%');}, 300);
            setTimeout(function(){squares[3].css('top', '50%');}, 400);
        } else if (numSquares == 6) {
            setTimeout(function(){squares[0].css('top', 0);}, 100);
            setTimeout(function(){squares[1].css('top', 0);}, 200);
            setTimeout(function(){squares[2].css('top', 0);}, 300);
            setTimeout(function(){squares[3].css('top', '50%');}, 400);
            setTimeout(function(){squares[4].css('top', '50%');}, 500);
            setTimeout(function(){squares[5].css('top', '50%');}, 600);
        } else if (numSquares == 9) {
            setTimeout(function(){squares[0].css('top', 0);}, 100);
            setTimeout(function(){squares[1].css('top', 0);}, 200);
            setTimeout(function(){squares[2].css('top', 0);}, 300);
            setTimeout(function(){squares[3].css('top', '33.3333333333%');}, 400);
            setTimeout(function(){squares[4].css('top', '33.3333333333%');}, 500);
            setTimeout(function(){squares[5].css('top', '33.3333333333%');}, 600);
            setTimeout(function(){squares[6].css('top', '66.6666666666%');}, 700);
            setTimeout(function(){squares[7].css('top', '66.6666666666%');}, 800);
            setTimeout(function(){squares[8].css('top', '66.6666666666%');}, 900);
        } else if (numSquares == 12) {
            setTimeout(function(){squares[0].css('top', 0);}, 100);
            setTimeout(function(){squares[1].css('top', 0);}, 200);
            setTimeout(function(){squares[2].css('top', 0);}, 300);
            setTimeout(function(){squares[3].css('top', 0);}, 400);
            setTimeout(function(){squares[4].css('top', '33.3333333333%');}, 500);
            setTimeout(function(){squares[5].css('top', '33.3333333333%');}, 600);
            setTimeout(function(){squares[6].css('top', '33.3333333333%');}, 700);
            setTimeout(function(){squares[7].css('top', '33.3333333333%');}, 800);
            setTimeout(function(){squares[8].css('top', '66.6666666666%');}, 900);
            setTimeout(function(){squares[9].css('top', '66.6666666666%');}, 1000);
            setTimeout(function(){squares[10].css('top', '66.6666666666%');}, 1100);
            setTimeout(function(){squares[11].css('top', '66.6666666666%');}, 1200);
        }
    },

    setGameEventListeners = function(){
        $gameboard.on('click', '.square'+numSquares, function(){
            if (!animating){
                animating = true;
                setTimeout(function(){animating = false;}, 200);

                playerSequence.push($(this).attr('id'));
                currentId = playerSequence[playerSequence.length-1];

                if(currentPlayer > -1){

                    numClicks++;

                    // Animation Events.
                    $(this).css({
                        '-webkit-transform': 'scale(0.9)',
                        'transform': 'scale(0.9)'
                    });
                    setTimeout(function(){$gameboard.find('#'+currentId).css({
                        'top': '150%',
                        '-webkit-transform': 'scale(1)',
                        'transform': 'scale(1)'
                    });}, 300);

                    // Sound Events.
                    soundTextures[randTextureSequence[texturesCount]].play();
                    texturesCount++;
                    if (texturesCount > 5) texturesCount = 0;

                    if (numClicks == numSquares){
                        matched = 0;
                        for (var i = 0; i < numSquares; i++){
                            if (randSquareSequence[i] != playerSequence[i]) {
                                $incorrect.css({
                                    'opacity': 1,
                                    'webkit-transform': 'scale(1)',
                                    'transform': 'scale(1)'
                                });
                                matched = 0;
                                break;
                            }
                            else matched++;
                        }
                        if (matched > 0) $correct.css({
                            'opacity': 1,
                            'webkit-transform': 'scale(1)',
                            'transform': 'scale(1)'
                        });

                        $menu.css('top', 0);
                        $ready.css('bottom', 0);
                    }
                }
            }
        });
    },

    computerTurn = function(){
        squares[randSquareSequence[computerSquareCount]].css('top', '150%');
        notes[randNoteSequence[computerCount-1]].play();
        computerCount--;
        computerSquareCount++;
        if (computerCount > 0) setTimeout(computerTurn, 1000);
        else {
            currentPlayer = 0;
            numClicks = 0;
            playerSequence = [];
            setTimeout(function(){animateSquares();}, 400);
            
        }
    },

    promptReady = function(){
        animateSquares();
        currentPlayer = -1;
        shuffle(randSquareSequence);
        setTimeout(function(){
            computerSquareCount = 0;
            computerCount = numSquares;
            computerTurn();
        }, numSquares*300);
    };
});