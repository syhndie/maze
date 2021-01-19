const cells = 16;
const width = 700;
const height = 700;
const wallThickness = 5;
//length of one side of one cell
const unitLength = width / cells;
const upKey = 'ArrowUp';
const downKey = 'ArrowDown';
const leftKey = 'ArrowLeft';
const rightKey = 'ArrowRight';
const velocityBump = 2;

//destructure necessary parameters from Matter.js
const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body } = Matter;
//create instances of Engine, World, and Render
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false,
    }
});
//render the world
Render.run(render);
Runner.run(Runner.create(), engine);

//create outside boundary walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true })
];
World.add(world, walls);


//maze generation

//function to randomize neighbors of current cell when stepping 
//through the maze creation process
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};
//array that reprsents the cells of the maze
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));
//array of vertical walls
//each array in verticals is a row of  vertical walls
//each element in that array is an actual wall
//true means 'is open'
const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));
//array of horizontal walls
//each array in horizontals is a row of horizontal walls
//each element in the array is an actual wall
//true means 'is open'
const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    //if i have visited the cell, then return
    if (grid[row][column]) {
        return;
    }

    //mark cell as being visited (true)
    //eventually all cells will be true
    grid[row][column] = true;

    //assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    //for each  neighbor . . . 
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        //check if neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue;
        }
        //check if i have visited that neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        //remove wall that is being croseed (change to true (is open) in horizontal or vertical array)
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        //visit the cell (run this function with the new cell's row/column)
        stepThroughCell(nextRow, nextColumn);
    }
};
stepThroughCell(startRow, startColumn);

//create inner maze walls
horizontals.forEach((row, rowIndex) => {
    row.forEach((isOpen, columnIndex) => {
        //if passage is open, skip that wall
        if (isOpen) {
            return;
        }
        const wall = Bodies.rectangle(
            //find the x coordinate of the center of the horizonal wall
            columnIndex * unitLength + unitLength / 2,
            //find the y coordinate of the center of the horizontal wall
            rowIndex * unitLength + unitLength,
            //the width of the horizontal wall
            unitLength,
            wallThickness,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});
verticals.forEach((row, rowIndex) => {
    row.forEach((isOpen, columnIndex) => {
        //if passage is open, skip that wall
        if (isOpen) {
            return;
        }
        const wall = Bodies.rectangle(
            //find the x coordinate of the center of the vertical wall
            columnIndex * unitLength + unitLength,
            //find the y coordinate of the center of the vertical wall
            rowIndex * unitLength + unitLength / 2,
            wallThickness,
            //the heigth of the vertical wall
            unitLength,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

//Goal
const goal = Bodies.rectangle(
    //x coordinate of center of lower right square in the grid
    width - unitLength / 2,
    //y coordinate of center of lower right square in the grid
    height - unitLength / 2,
    //make the goal half the size of a cell
    unitLength / 2,
    unitLength / 2,
    {
        isStatic: true,
        render: { fillStyle: 'green' }
    }
);
World.add(world, goal);

//Ball that user moves
const ball = Bodies.circle(
    //starting x coordinate - center  of upper left cell
    unitLength / 2,
    //starting y coordinate - center  of upper left cell
    unitLength / 2,
    //make the ball half the size of a cell - radius half that 
    unitLength / 4,
    {

        render: { fillStyle: 'red' }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    if (event.key === rightKey) {
        Body.setVelocity(ball, { x: x + velocityBump, y });
    }
    if (event.key === upKey) {
        Body.setVelocity(ball, { x, y: y - velocityBump });
    }
    if (event.key === leftKey) {
        Body.setVelocity(ball, { x: x - velocityBump, y });
    }
    if (event.key === downKey) {
        Body.setVelocity(ball, { x, y: y + velocityBump });
    }
});