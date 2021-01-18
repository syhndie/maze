const {
    Engine,
    Render,
    Runner,
    World,
    Bodies } = Matter;

const cells = 10;
const width = 600;
const height = 600;
const wallThickness = 6;

//length of one side of one cell
const unitLength = width / cells;

const engine = Engine.create();
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
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true }),
    Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true })
];
World.add(world, walls);

//maze generation
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
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));
const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));
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
        //remove wall that is being croseed (change to true in horizontal or vertical array)
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

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
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
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            wallThickness,
            unitLength,
            {
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});
