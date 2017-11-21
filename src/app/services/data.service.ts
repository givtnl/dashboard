import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise'; //to support toPromise

@Injectable()
export class DataService {
    dataDictionary = new Dictionary<any>();

    constructor() {
    }

    writeData(key:any, data:any, local:boolean = false){
        if(local){
            localStorage.setItem(key, data);
            this.dataDictionary.Add(key, data);
        }else{
            sessionStorage.setItem(key, data);
            this.dataDictionary.Add(key, data);
        }
    }
    getData(key: any){
        if(this.dataDictionary.Item(key))
        {
            return this.dataDictionary.Item(key);
        }
        else if(localStorage.getItem(key)){
            this.dataDictionary.Add(key, localStorage.getItem(key));
            return this.dataDictionary.Item(key);
        }
        else if(sessionStorage.getItem(key)){
            this.dataDictionary.Add(key, sessionStorage.getItem(key));
            return this.dataDictionary.Item(key);
        }
    }

    clearAll(){
        this.dataDictionary.Truncate();
        sessionStorage.clear();
        localStorage.clear();
    }
}

export class Dictionary<T> {
    private items: { [index: string]: T } = {};

    private count: number = 0;

    public ContainsKey(key: any): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Truncate(){
        this.items = {};
    }

    public Count(): number {
        return this.count;
    }

    public Add(key: any, value: T) {
        this.items[key] = value;
        this.count++;
    }

    public Remove(key: any): T {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: any): T {
        return this.items[key];
    }

    public Keys(): any[] {
        return Object.keys(this.items);
    }

    public Values(): any[] {
        return Object.keys(this.items).map(function(key) {
            return this.items[key];
        });
    }
}
