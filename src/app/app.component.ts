import { Component } from '@angular/core';
import { Solver } from './solver';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Solver';
    testCases = [{
        hintLine: [1, 1, 1],
        boardData: [0,-1,-1,-1,-1,-1]
    },{
        hintLine: [1, 1],
        boardData: [0,-1, 0,-1,-1,-1]
    },{
        hintLine: [2, 1],
        boardData: [0,-1,-1,-1, 0,-1]
    },{
        hintLine: [2, 1],
        boardData: [0,-1, 0,-1,-1,-1]
    },{
        hintLine: [2, 1],
        boardData: [1, 0,-1,-1,-1,-1]
    },{
        hintLine: [2, 1],
        boardData: [1,-1,-1,-1,-1,-1]
    },{
        hintLine: [3],
        boardData: [0,-1, 0,-1,-1,-1]
    },{
        hintLine: [3,1],
        boardData: [0,-1, 0,-1,-1,-1]
    },{
        hintLine: [3],
        boardData: [0,-1, 0, 0,-1,-1]
    },{
        hintLine: [3,2],
        boardData: [1,-1, 1, 0,-1, 1]
    },{
        hintLine: [3],
        boardData: [1,-1, 1, 1,-1,-1]
    }];

    prettify(data: number[]) {
        return data.reduce((prev, e) => { return prev + "∗X♦"[e+1] }, "")
    }

    solve(caseIndex: number) {

        let solver = new Solver(
            this.testCases[caseIndex].boardData,
            this.testCases[caseIndex].hintLine.map(item => { return { hint: item }}));
        solver.solveLine(0);
    }
}
