import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { People, people } from './sample-data';

export class Group {
  level: number = 0;
  parent: Group;
  expanded: boolean = true;
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
}

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'table-basic-example',
  styleUrls: ['table-basic-example.css'],
  templateUrl: 'table-basic-example.html',
})
export class TableBasicExample implements OnInit, AfterViewInit {
  @ViewChild('input') input: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['surname', 'forename', 'gender', 'ukCity', 'salary', 'department'];
  public dataSource = new MatTableDataSource<People | Group>([]);

  // groupByColumns: string[] = ['department', 'salary'];
  groupByColumns: string[] = ['department'];
  peopleData: any[];
  data: any[];
  constructor() {
    this.data = people;


  }

  customFilterPredicate(data: People | Group, filter: string): boolean {
    return (data instanceof Group) ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: People): boolean {
    const groupRows = this.dataSource.data.filter(
      row => {
        if (!(row instanceof Group)) return false;

        let match = true;
        this.groupByColumns.forEach(
          column => {
            if (!row[column] || !data[column] || row[column] !== data[column]) match = false;
          }
        );
        return match;
      }
    );

    if (groupRows.length === 0) return true;
    if (groupRows.length > 1) throw "Data row is in more than one group!";
    const parent = <Group>groupRows[0];  // </Group> (Fix syntax coloring)

    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row) {
    row.expanded = !row.expanded
    this.dataSource.filter = performance.now().toString();  // hack to trigger filter refresh
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    var rootGroup = new Group();
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: Group): any[] {
    // Recursive function, stop when there are no more levels. 
    if (level >= groupByColumns.length)
      return data;

    var groups = this.uniqueBy(
      data.map(
        row => {
          var result = new Group();
          result.level = level + 1;
          result.parent = parent;
          for (var i = 0; i <= level; i++)
            result[groupByColumns[i]] = row[groupByColumns[i]];
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];

    var subGroups = [];
    groups.forEach(group => {
      let rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn])
      let subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    })
    return subGroups;
  }

  uniqueBy(a, key) {
    var seen = {};
    return a.filter(function (item) {
      3

      var k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
  }

  isGroup(index, item): boolean {
    return item.level;
  }
  ngOnInit() {
    this.data = people;
    this.peopleData = this.addGroups(people, this.groupByColumns);
    // this.dataSource.data = this.addGroups(people, this.groupByColumns);
    console.log(this.peopleData)
    this.dataSource.data = this.peopleData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  }
  ngAfterViewInit() {


    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {

          if (this.input.nativeElement.value.length > 0) {
            this.dataSource.data = this.addGroups(people.filter(p => Object.values(p).join().toLowerCase().includes(this.input.nativeElement.value.toLowerCase())), this.groupByColumns);

            console.log(this.input.nativeElement.value);
          }
          else {
            this.dataSource.data = this.addGroups(people, this.groupByColumns);
          }
        })
      )
      .subscribe(() => { });
  }


  pagesize() {
    console.log('page');
  }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */