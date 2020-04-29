import test from 'ava';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonFilter, JsonFilterType} from '../src/decorators/JsonFilter';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonGetter} from '../src/decorators/JsonGetter';

test('@JsonFilter at class level', t => {

  @JsonFilter({value: 'studentFilter'})
  class Student {
    @JsonProperty({value: 'stdName'}) @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [Number]})
    age: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    college: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    city: string;

    constructor(name: string, age: number, college: string, city: string) {
      this.name = name;
      this.age = age;
      this.college = college;
      this.city = city;
    }
  }
  const student = new Student('Mohit', 30, 'ABCD', 'Varanasi');

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['stdName', 'city']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"age":30,"college":"ABCD"}'));

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['stdName', 'city']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"stdName":"Mohit","city":"Varanasi"}'));

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"stdName":"Mohit","age":30,"college":"ABCD","city":"Varanasi"}'));
});

test('@JsonFilter at property level', t => {
  class Company {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    @JsonProperty()
    @JsonFilter({value: 'ceoFilter'})
    @JsonClassType({type: () => [Employee]})
    ceo: Employee;

    // eslint-disable-next-line no-shadow
    constructor(name: string, @JsonClassType({type: () => [Employee]}) ceo: Employee) {
      this.name = name;
      this.ceo = ceo;
    }
  }

  class Employee {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty({value: 'empAge'}) @JsonClassType({type: () => [Number]})
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const ceo = new Employee('John Alfa', 50);
  const company = new Company('Apple', ceo);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"name":"John Alfa"}}'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"empAge":50}}'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"name":"John Alfa","empAge":50}}'));
});

test('@JsonFilter at method level', t => {
  class Company {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    @JsonProperty()
    @JsonClassType({type: () => [Employee]})
    ceo: Employee;

    // eslint-disable-next-line no-shadow
    constructor(name: string, @JsonClassType({type: () => [Employee]}) ceo: Employee) {
      this.name = name;
      this.ceo = ceo;
    }

    @JsonGetter()
    @JsonFilter({value: 'ceoFilter'})
    @JsonClassType({type: () => [Employee]})
    getCeo(): Employee {
      return this.ceo;
    }
  }

  class Employee {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty({value: 'empAge'}) @JsonClassType({type: () => [Number]})
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const ceo = new Employee('John Alfa', 50);
  const company = new Company('Apple', ceo);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"name":"John Alfa"}}'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"empAge":50}}'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"Apple","ceo":{"name":"John Alfa","empAge":50}}'));
});

test('@JsonFilter at property level of type Array', t => {
  class Company {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    @JsonProperty()
    @JsonFilter({value: 'employeeFilter'})
    @JsonClassType({type: () => [Array, [Employee]]})
    employees: Employee[] = [];

    constructor(name: string, @JsonClassType({type: () => [Array, [Employee]]}) employees: Employee[]) {
      this.name = name;
      this.employees = employees;
    }
  }

  class Employee {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty({value: 'empAge'}) @JsonClassType({type: () => [Number]})
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const employee1 = new Employee('John Alfa', 50);
  const employee2 = new Employee('John Beta', 45);
  const company = new Company('Apple', [employee1, employee2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      employeeFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });

  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"employees":[{"name":"John Alfa"},{"name":"John Beta"}],"name":"Apple"}'));
});
