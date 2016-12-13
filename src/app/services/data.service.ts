import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise'; //to support toPromise

@Injectable()
export class DataService {
    dataDictionary = new Dictionary<string>();

    constructor() {
    }

    writeData(key:string, data:string, local:boolean = false){
        console.log("writing data: " + key);
        if(local){
            localStorage.setItem(key, data);
            this.dataDictionary.Add(key, data);
        }else{
            sessionStorage.setItem(key, data);
            this.dataDictionary.Add(key, data);
        }
    }

    getData(key: string){
        console.log("reading data: " + key);
        if(this.dataDictionary.Item(key))
        {
            console.log("fetched data in dictionary : " + this.dataDictionary.Item(key));
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

    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Truncate(){
        this.items = {};
    }

    public Count(): number {
        return this.count;
    }

    public Add(key: string, value: T) {
        this.items[key] = value;
        this.count++;
    }

    public Remove(key: string): T {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }

    public Item(key: string): T {
        return this.items[key];
    }

    public Keys(): string[] {
        return Object.keys(this.items);
    }

    public Values(): string[] {
        return Object.values(this.items);
    }
}