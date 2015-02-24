var TickTacToe = function() {
	var instance = {

		board: [0,0,0,0,0,0,0,0,0],


		boardWinner: function() {

			// This function examines the board array and returns the winning cell value. 0 is treated as empty.

			var board = instance.board;

			// Check for column (vertical) win:
			for (var column = 0; column < 3; column++) {
				if (board[column] != 0 && instance.equalAtIndex(board, column, column + 3, column + 6)) {
					return {
					 type: 'vertical', 'winner': board[column], column: column 
					};
				}
			}

			// Check for row (horizontal) win:
			for (var row = 0; row < 3; row++) {
				var cellOffset = row * 3;
				if (board[cellOffset] != 0 && instance.equalAtIndex(board, cellOffset, cellOffset + 1, cellOffset + 2)) {
					return { type: 'horizontal', 'winner': board[cellOffset], row: row };
				}
			}

			// Check for diagonal win
			if (board[0] != 0 && instance.equalAtIndex(board, 0, 4, 8)) {
				return { type: 'diagonal-right', 'winner': board[row] };
			} else if (board[2] != 0 && instance.equalAtIndex(board, 2, 4, 6)) {
				return { type: 'diagonal-left', 'winner': board[row] };
			}

			return null;
		},

		isFull: function() {

			// Returns whether the board is fully populated or not.
			for(var i = 0; i < 9; i++) {
				if(instance.board[i] == 0) {
					return false;
				}
			}

			return true;

		},


		equalAtIndex: function(board, i, j, k) {
			return board[i] == board[j] && board[j] == board[k];
		},

		set: function(game, value, position) {
			game.board[position] = value;
		},

		emptyGame: function() {
			return {
				depth: 0,
				children: [],
				parent: null
			};
		}

	};

	return instance;
};


var CanvasBoardRenderer = function(board, canvas, offsetX, offsetY) {

	var rendererInstance = {

		width: 600,
		height: 600,
		canvas: canvas[0],
		board: board,

		render: function() {

			console.log(rendererInstance);

			var ctx = rendererInstance.canvas.getContext('2d');
			var w = rendererInstance.width;
			var h = rendererInstance.height;
			var offX, offY;
			offX = rendererInstance.offsetX;
			offY = rendererInstance.offsetY;

			ctx.translate(offX, offY);

			// Clear the context
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, w, h);
			ctx.lineWidth = 0.025 * w;

			// Draw two thick vertical black lines
			ctx.beginPath();
			ctx.moveTo(w / 3, 0);
			ctx.lineTo(w / 3, h);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(2 * w / 3, 0);
			ctx.lineTo(2 * w / 3, h);
			ctx.stroke();

			// Draw two thick horizontal black lines
			ctx.beginPath();
			ctx.moveTo(0, h / 3);
			ctx.lineTo(w, h / 3);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, 2 * h / 3);
			ctx.lineTo(w, 2 * h / 3);
			ctx.stroke();

			for (var i = 0; i < rendererInstance.board.length; i++) {
				rendererInstance.renderValueAtIndexInCell(i);
			}

		},


		renderWinLayer: function(winInformation) {

			// The winInformation object we expect here should be constructed by the Metatick.boardWinner() method.

			var ctx = rendererInstance.canvas.getContext('2d');
			var w = rendererInstance.width;
			var h = rendererInstance.height;

			// Render semi-transparent white layer over the board
			ctx.fillStyle = 'white';
			ctx.globalAlpha = 0.5;
			ctx.fillRect(0, 0, w, h);
			ctx.lineWidth = 0.025 * w;
			ctx.globalAlpha = 1;

			ctx.strokeStyle = 'red';

			console.log("WIN!");
			console.log(winInformation);

			if (winInformation.winner == 1) {
				// Winner is X.
				// Render big red X

				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(w, h);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(w, 0);
				ctx.lineTo(0, h);
				ctx.stroke();

			} else {
				// Winner is O.
				// Render big red O

				ctx.beginPath();
				ctx.arc(w / 2, h / 2, w / 3, 0, 2 * Math.PI);
				ctx.stroke();

			}

			ctx.strokeStyle = 'black';

		},

		renderValueAtIndexInCell: function(index) {

			var value = rendererInstance.board[index];
			var ctx = rendererInstance.canvas.getContext('2d');

			var symbolRadius = (rendererInstance.width / 10);

			var xMultiplier = (rendererInstance.width / 3);
			var yMultiplier = (rendererInstance.height / 3);

			var renderPositionX = (index % 3) * xMultiplier;
			var renderPositionY = Math.floor(((index / 3) % 3)) * yMultiplier;

			renderPositionX += (rendererInstance.width / 6);
			renderPositionY += (rendererInstance.height / 6);

			if (value == 1) {
				// Draw X
				ctx.beginPath();
				ctx.moveTo(renderPositionX - symbolRadius, renderPositionY -symbolRadius);
				ctx.lineTo(renderPositionX + symbolRadius, renderPositionY + symbolRadius);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(renderPositionX + symbolRadius, renderPositionY -symbolRadius);
				ctx.lineTo(renderPositionX - symbolRadius, renderPositionY + symbolRadius);
				ctx.stroke();
			} else if (value == 2) {
				// Draw O

				ctx.beginPath();
				ctx.arc(renderPositionX, renderPositionY, symbolRadius, 0, 2 * Math.PI);
				ctx.stroke();

			}

		}

	};

	return rendererInstance;
}

var TickTacToeController = function(game, canvas) {

	var controllerInstance = {

		game: game,	
		canvas: canvas,
		xTurn: false,

		clickQuadrant: function(row, col) {

			// Decide what happens if one clicks a quadrant with given discrete coordinates.

			var linearIndex = controllerInstance.coordinateToIndex(row, col);
			var currentGame = controllerInstance.game;

			if (currentGame.board[linearIndex] == 0) {
				// Only if the cell is empty
				if (controllerInstance.xTurn) {
					controllerInstance.game.set(currentGame, 1, linearIndex);
				} else {
					controllerInstance.game.set(currentGame, 2, linearIndex);
				}

				controllerInstance.xTurn = !controllerInstance.xTurn;
				controllerInstance.renderGUI();
			}

			

		},


		renderGUI: function() {
			var currentGame = controllerInstance.game;
			var renderer = CanvasBoardRenderer(currentGame.board, controllerInstance.canvas, 0, 0);

			var boardWinner = controllerInstance.game.boardWinner(currentGame.board);



			renderer.render();
			if (boardWinner !== null) {

				renderer.renderWinLayer(boardWinner);

				if (boardWinner.winner == 1) {
					alert("X is the Winner!");
				} else if(boardWinner.winner == 2) {
					alert("O is the Winner!");
				}

				window.location = window.location;				
			} else {

			}

			if (controllerInstance.xTurn) {
				$('#turnSymbol').text('X');
			} else {
				$('#turnSymbol').text('O');
			}

			

		},

		findCoordinate: function(segmentCount, segmentRatio) {

			// Finds the discrete matrix coordinate given a number of equal segments to search in (segmentCount)
			// The ratio of the actual coordinate to its canvas' width or height (segmentRatio)

			var sideMultiplier = 1 / segmentCount;

			for(var segMult = 0; segMult < segmentCount; segMult++) {
				if (segmentRatio >= segMult * sideMultiplier && segmentRatio <= (segMult + 1) * sideMultiplier) {
					return segMult;
				}
			}

		},

		coordinateToIndex: function(row, col) {
			// Returns an index 0..9 from a pair of discrete coordinates
			return (row * 3) + col;
		}

	};


	canvas.click(function(e) {
		// Compute the quadrant index using X and Y coordinates.
		var w, h;
		w = canvas.width(), h = canvas.height();

		// The row is computed using current Y:
		var rowRatio = e.clientY / h;
		var colRatio = e.clientX / w;

		var row = controllerInstance.findCoordinate(3, rowRatio);
		var col = controllerInstance.findCoordinate(3, colRatio);


		controllerInstance.clickQuadrant(row, col);


	});

	controllerInstance.renderGUI();


	return controllerInstance;
};


$(document).ready(function() {


	var game = TickTacToe();
	var controller = TickTacToeController(game, $('#game'));
});
