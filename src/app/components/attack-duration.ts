import { Component } from "./component";

export class AttackDuration extends Component{
    override type: string = "AttackDuration";
    duration: number;
    constructor(duration: number){
        super();
        this.duration = duration;
    }
}
