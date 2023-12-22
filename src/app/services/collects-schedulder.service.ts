import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CreateAllocationCommand } from '../models/collect-scheduler/create-allocation.command';
import { Observable } from 'rxjs';
import { AllocationDetailModel } from '../models/collect-scheduler/allocation-detail.model';
import { UpdateAllocationCommand } from '../models/collect-scheduler/update-allocation.command';
import { AllocationListModel } from '../models/collect-scheduler/allocation-list.model';
import { BankAccountModel } from '../models/collect-scheduler/bank-account.model';

import { getApiUrl } from './helpers/api-url.helper';
import 'rxjs/add/operator/map'

@Injectable()
export class CollectSchedulerService {
    private apiUrl:string;
    private apiV2Url:string;

    constructor(private http: HttpClient) {
        this.apiUrl = getApiUrl() + '/api/collectgroups/';
        this.apiV2Url = getApiUrl() + '/api/v2/collectgroups/';
    }

    public getAll(collectGroupId: string, pageSize: number, pageNumber: number): Observable<Array<AllocationListModel>> {
        var queryParams = new HttpParams();
        queryParams = queryParams.set('pageSize', pageSize.toString());
        queryParams = queryParams.set('pageNumber', pageNumber.toString());
        return this.http.get<Array<AllocationListModel>>(`${this.apiUrl}${collectGroupId}/allocations`, {
            params: queryParams
        });
    }

    public createAllocation(collectGroupId: string, command: CreateAllocationCommand): Observable<AllocationDetailModel> {
        return this.http.post<AllocationDetailModel>(`${this.apiUrl}${collectGroupId}/allocations`, command);
    }

    public updateAllocation(collectGroupId: string, allocationId: number, command: UpdateAllocationCommand): Observable<object> {
        return this.http.put(`${this.apiUrl}${collectGroupId}/allocations/${allocationId}`, command);
    }

    public deleteAllocation(collectGroupId: string, allocationId: number): Observable<object> {
        return this.http.delete(`${this.apiUrl}${collectGroupId}/allocations/${allocationId}`);
    }

    public deleteAllocations(collectGroupId: string, allocationIds: number[]): Observable<object> {
        //ty oude angular -_-'
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                collectGroupId,
                ids: allocationIds
            }
        };
        return this.http.delete(`${this.apiUrl}${collectGroupId}/allocations`, options);
    }

    public getAllActiveAccounts(collectGroupId: string) : Observable<Array<BankAccountModel>> {
        return this.http.get<Array<BankAccountModel>>(`${this.apiV2Url}${collectGroupId}/organisation/accounts`)
            .map(bankAccounts => bankAccounts.filter(bankAccount => bankAccount.Active));
    }
}
