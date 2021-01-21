const cellsHorizontal = 4;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;
const wallThickness = 5;
//length of one side of one cell
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
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
    Body,
    Events } = Matter;

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
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));
//array of vertical walls
//each array in verticals is a row of  vertical walls
//each element in that array is an actual wall
//true means 'is open'
const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));
//array of horizontal walls
//each array in horizontals is a row of horizontal walls
//each element in the array is an actual wall
//true means 'is open'
const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
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
            columnIndex * unitLengthX + unitLengthX / 2,
            //find the y coordinate of the center of the horizontal wall
            rowIndex * unitLengthY + unitLengthY,
            //the width of the horizontal wall
            unitLengthX,
            wallThickness,
            {
                label: 'innerWall',
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
            columnIndex * unitLengthX + unitLengthX,
            //find the y coordinate of the center of the vertical wall
            rowIndex * unitLengthY + unitLengthY / 2,
            wallThickness,
            //the heigth of the vertical wall
            unitLengthY,
            {
                label: 'innerWall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

//Goal
const goalWidth = Math.min(unitLengthX, unitLengthY) / 2;
const goal = Bodies.rectangle(
    //x coordinate of center of lower right square in the grid
    width - unitLengthX / 2,
    //y coordinate of center of lower right square in the grid
    height - unitLengthY / 2,
    //make the goal half the size of a cell
    goalWidth,
    goalWidth,
    {
        isStatic: true,
        label: 'goal',
        render: { fillStyle: 'green' }
    }
);
World.add(world, goal);

//Ball that user moves
const radius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    //starting x coordinate - center  of upper left cell
    unitLengthX / 2,
    //starting y coordinate - center  of upper left cell
    unitLengthY / 2,
    //make the ball half the size of a cell - radius half that 
    radius,
    {
        label: 'ball',
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

//Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if (body.label === 'innerWall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});