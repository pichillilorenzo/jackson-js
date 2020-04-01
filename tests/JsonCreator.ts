import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonProperty} from '../src/annotations/JsonProperty';
import {JsonCreator} from '../src/annotations/JsonCreator';
import {ObjectMapper} from '../src/databind/ObjectMapper';

test('@JsonCreator on class', t => {
  @JsonCreator()
  class Employee {
    id: number;
    name: string;
    department: string;

    constructor(id: number, @JsonProperty({value: 'empName'}) name: string,
      @JsonProperty({value: 'empDept'}) department: string) {
      this.id = id;
      this.name = name;
      this.department = department;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = `{
  "id": 1,
  "empName": "Chris",
  "empDept": "Admin"
}`;
  const employee = objectMapper.parse<Employee>(jsonData, {mainCreator: () => [Employee]});

  t.assert(employee instanceof Employee);
  t.is(employee.id, 1);
  t.is(employee.name, 'Chris');
  t.is(employee.department, 'Admin');
});

test('@JsonCreator on static method with and without creator name', t => {
  class Employee {
    id: number;
    name: string;
    department: string;

    constructor(id: number, name: string, department: string) {
      this.id = id;
      this.name = name;
      this.department = department;
    }

    @JsonCreator()
    static toEmployee(id: number, @JsonProperty({value: 'empName'}) name: string,
      @JsonProperty({value: 'empDept'}) department: string): Employee {
      return new Employee(id, name, department);
    }

    @JsonCreator({name: 'AnotherEmployeeCreator'})
    static toAnotherEmployee(id: number, @JsonProperty({value: 'anotherEmpName'}) anotherName: string,
      @JsonProperty({value: 'anotherEmpDept'}) anotherDepartment: string): Employee {
      return new Employee(id, 'Another ' + anotherName, 'Another ' + anotherDepartment);
    }
  }

  const jsonData = `{
  "id": 1,
  "empName": "Chris",
  "empDept": "Admin"
}`;

  const objectMapper = new ObjectMapper();
  const employee = objectMapper.parse<Employee>(jsonData, {mainCreator: () => [Employee]});
  t.assert(employee instanceof Employee);
  t.is(employee.id, 1);
  t.is(employee.name, 'Chris');
  t.is(employee.department, 'Admin');

  const anotherJsonData = `{
  "id": 1,
  "anotherEmpName": "Chris",
  "anotherEmpDept": "Admin"
}`;

  const anotherEmployee = objectMapper.parse<Employee>(anotherJsonData, {
    mainCreator: () => [Employee],
    withCreatorName: 'AnotherEmployeeCreator'
  });
  t.assert(anotherEmployee instanceof Employee);
  t.is(anotherEmployee.id, 1);
  t.is(anotherEmployee.name, 'Another Chris');
  t.is(anotherEmployee.department, 'Another Admin');
});

test('Fail @JsonCreator with multiple creators with same name', t => {
  const err = t.throws<JacksonError>(() => {
    class Employee {
      id: number;
      name: string;
      department: string;

      constructor(id: number, name: string, department: string) {
        this.id = id;
        this.name = name;
        this.department = department;
      }

      @JsonCreator({name: 'creatorName'})
      static toEmployee(id: number, @JsonProperty({value: 'empName'}) name: string,
        @JsonProperty({value: 'empDept'}) department: string): Employee {
        return new Employee(id, name, department);
      }

      @JsonCreator({name: 'creatorName'})
      static toAnotherEmployee(id: number, @JsonProperty({value: 'anotherEmpName'}) anotherName: string,
        @JsonProperty({value: 'anotherEmpDept'}) anotherDepartment: string): Employee {
        return new Employee(id, 'Another ' + anotherName, 'Another ' + anotherDepartment);
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
