import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/collects-scheduler.component.html',
  styleUrls: ['../css/collects-scheduler.component.css']
})


export class CollectsShedulerComponent implements OnInit {
  title = 'Collecte rooster'
  roster = ""
  constructor() { }
  ngOnInit() { 

   }
}


