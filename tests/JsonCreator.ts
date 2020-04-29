import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonCreator, JsonCreatorMode} from '../src/decorators/JsonCreator';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonClassType} from '../src/decorators/JsonClassType';

test('@JsonCreator on class', t => {
  @JsonCreator()
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    department: string;

    constructor(id: number,
      @JsonProperty({value: 'empName'}) name: string,
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

test('@JsonCreator on class using JsonCreatorMode.DELEGATING mode', t => {
  @JsonCreator({mode: JsonCreatorMode.DELEGATING})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    department: string;

    constructor(obj: {id: number; empName: string; empDept: string}) {
      this.id = obj.id;
      this.name = obj.empName;
      this.department = obj.empDept;
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
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    department: string;

    constructor(id: number, name: string, department: string) {
      this.id = id;
      this.name = name;
      this.department = department;
    }

    @JsonCreator()
    static toEmployee(id: number,
      @JsonProperty({value: 'empName'}) name: string,
      @JsonProperty({value: 'empDept'}) department: string): Employee {
      return new Employee(id, name, department);
    }

    @JsonCreator({name: 'AnotherEmployeeCreator'})
    static toAnotherEmployee(id: number,
      @JsonProperty({value: 'anotherEmpName'}) anotherName: string,
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

test('@JsonCreator on static method with and without creator name using JsonCreatorMode.DELEGATING mode', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    department: string;

    constructor(id: number, name: string, department: string) {
      this.id = id;
      this.name = name;
      this.department = department;
    }

    @JsonCreator({mode: JsonCreatorMode.DELEGATING})
    static toEmployee(obj: {id: number; empName: string; empDept: string}): Employee {
      return new Employee(obj.id, obj.empName, obj.empDept);
    }

    @JsonCreator({name: 'AnotherEmployeeCreator', mode: JsonCreatorMode.DELEGATING})
    static toAnotherEmployee(obj: {id: number; anotherEmpName: string; anotherEmpDept: string}): Employee {
      return new Employee(obj.id, 'Another ' + obj.anotherEmpName, 'Another ' + obj.anotherEmpDept);
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
      @JsonProperty() @JsonClassType({type: () => [Number]})
      id: number;
      @JsonProperty() @JsonClassType({type: () => [String]})
      name: string;
      @JsonProperty() @JsonClassType({type: () => [String]})
      department: string;

      constructor(id: number, name: string, department: string) {
        this.id = id;
        this.name = name;
        this.department = department;
      }

      @JsonCreator({name: 'creatorName'})
      static toEmployee(id: number,
        @JsonProperty({value: 'empName'}) name: string,
        @JsonProperty({value: 'empDept'}) department: string): Employee {
        return new Employee(id, name, department);
      }

      @JsonCreator({name: 'creatorName'})
      static toAnotherEmployee(id: number,
        @JsonProperty({value: 'anotherEmpName'}) anotherName: string,
        @JsonProperty({value: 'anotherEmpDept'}) anotherDepartment: string): Employee {
        return new Employee(id, 'Another ' + anotherName, 'Another ' + anotherDepartment);
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
