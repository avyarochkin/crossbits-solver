export enum BOARD_CELL {
    NIL = -1,
    OFF = 0,
    ON = 1
}
export interface BoardLineBlock {
    value: BOARD_CELL,
    length: number
}
export interface HintCell {
    hint: number
}
export interface HintLineBlock {
    offset: number,
    length: number
}


export class Solver {

    private boardLine: BOARD_CELL[]

    private hints: HintCell[][]

    constructor(boardLine: BOARD_CELL[], hintLine: HintCell[]) {
        this.boardLine = boardLine
        this.hints = [hintLine]
    }

    private getBoardLength() {
        return this.boardLine.length
    }

    public solveLine(lineIndex: number) {

        const self = this
        const dataLength = this.getBoardLength()
        const hintLength = this.hints[lineIndex].length
        /**/
        const dataBlocks = Array<BoardLineBlock>(dataLength)
        /**/
        const variant = Array<HintLineBlock>(hintLength)
        /**/
        const solution = Array(dataLength)
        /**/
        function createDataBlocks() {
            let len = 0
            let last: BOARD_CELL, current: BOARD_CELL
            self.boardLine.forEachReversed((element, index) => {
                current = (element === BOARD_CELL.OFF) ? element : BOARD_CELL.ON
                len = (current === last) ? len + 1 : 1
                last = current
                dataBlocks[index] = { value: element, length: len }
                return true
            })
            // console.log(dataBlocks)
        }
        /**/
        function buildVariantStartingAt(startIndex: number, offset: number): boolean {
            for (let hintIndex = startIndex; hintIndex < hintLength; hintIndex++) {
                const item = self.hints[lineIndex][hintIndex]
                let offsetEnd = offset + item.hint - 1

                do {
                    if (offsetEnd >= dataLength) return false
                    const preStartBlock = dataBlocks[offset - 1]
                    const startBlock = dataBlocks[offset]
                    const postEndBlock = dataBlocks[offsetEnd + 1]
                    // hint will fit if all of the following hold true:
                    // - cell before first one is not on (or does not exist)
                    // - first cell is on/nil and the length of its "on/nil" area >= hint value
                    // - cell after last one is not on (or does not exist)
                    if ((preStartBlock === undefined || preStartBlock.value !== BOARD_CELL.ON)
                        && (startBlock.value !== BOARD_CELL.OFF && startBlock.length >= item.hint)
                        && (postEndBlock === undefined || postEndBlock.value !== BOARD_CELL.ON)) break
                    // hint does not fit to the block at offset - check the next index
                    offset++
                    // offset += startBlock.length is wrong: it must not jump further than +1
                    offsetEnd = offset + item.hint - 1
                } while (true)

                variant[hintIndex] = { offset: offset, length: item.hint }
                offset += item.hint + 1
                // endIndex will update with the next iteration
            }
            console.log('Variant: ' + variant.toCompactString())
            // console.log(variant)
            return true
        }

        function buildNextVariant() {
            // if not initiliazed, build the first variant
            if (!variant[0]) return buildVariantStartingAt(0, 0)
            // try to shift a piece one cell forward starting with the last one
            for (let hintIndex = hintLength - 1; hintIndex >= 0; hintIndex--) {
                if (buildVariantStartingAt(hintIndex, variant[hintIndex].offset + 1)) return true
            }
            // all pieces are shifted to their last position - cannot build a new variant
            return false
        }

        function applyVariantToSolution() {
            let varIndex = 0
            let solutionApplicable = false
            for (let solIndex = 0; solIndex < dataLength; solIndex++) {
                let solItem = solution[solIndex]
                const varItem = variant[varIndex]
                if (varIndex >= hintLength || solIndex < varItem.offset) {
                    // apply to cells outside of variant pieces
                    solItem = (solItem === undefined || solItem === BOARD_CELL.OFF) ? BOARD_CELL.OFF : BOARD_CELL.NIL
                } else if (solIndex < varItem.offset + varItem.length) {
                    // apply to cells inside the variant pieces
                    solItem = (solItem === undefined || solItem === BOARD_CELL.ON) ? BOARD_CELL.ON : BOARD_CELL.NIL
                    // moving to the next piece
                    if (solIndex === varItem.offset + varItem.length - 1) varIndex++
                }
                solution[solIndex] = solItem
                // if at least one cell is set or unset, the solution is applicable
                if (solItem !== BOARD_CELL.NIL) solutionApplicable = true
            }
            // console.log(`Solution: ${solution}`)
            return solutionApplicable
        }

        function applySolutionToBoard() {
            // TODO
        }

        // MARK: main function

        let giveUp = false
        let time = performance.now()

        if (!hintLength) return false

        createDataBlocks()

        let variantsFound = 0
        while (!giveUp && buildNextVariant()) {
            variantsFound++
            giveUp = !applyVariantToSolution() || (performance.now() - time > 60000)
        }
        if (!giveUp) applySolutionToBoard()

        // logging stats
        time = (performance.now() - time) / 1000
        if (giveUp) {
            console.log(`Given up after ${variantsFound.toLocaleString()} variant(s) in ${time.toFixed(3)}s`)
        } else if (variantsFound > 0) {
            console.log(`${variantsFound.toLocaleString()} variant(s) found in ${time.toFixed(3)}s`)
        } else {
            console.warn(`No variants found in ${time.toFixed(3)}s`)
        }

    } // solveLine

}


declare global {
    interface Array<T> {
        forEachReversed(func)
        toCompactString()
    }
}

Array.prototype.forEachReversed = function(func) {
    for (let i = this.length - 1; i >= 0; i--) {
        if (!func(this[i], i, this)) return
    }
}
Array.prototype.toCompactString = function() {
    return this.reduce((prev, e, i) => {
        return prev + '∗'.repeat(this[i].offset - (i > 0 ? this[i - 1].offset + this[i - 1].length : 0)) + '♦'.repeat(e.length)
    }, '')
}
