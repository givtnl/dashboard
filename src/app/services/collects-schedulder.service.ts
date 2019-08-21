import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateAllocationCommand } from 'app/models/collect-scheduler/create-allocation.command';
import { Observable } from 'rxjs';
import { AllocationDetailModel } from 'app/models/collect-scheduler/allocation-detail.model';
import { UpdateAllocationCommand } from 'app/models/collect-scheduler/update-allocation.command';
import { AllocationListModel } from 'app/models/collect-scheduler/allocation-list.model';

@Injectable()
export class CollectSchedulerService {
    private apiUrl = environment.apiUrl + '/api/collectgroups/';

    constructor(private http: HttpClient) {}

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
}
