import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonProperty, JsonPropertyAccess} from '../src/annotations/JsonProperty';
import {ObjectMapper} from '../src/databind/ObjectMapper';

test('@JsonProperty with value', t => {
  class Employee {
    id: number;
    @JsonProperty({value: 'empName'})
    name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const employee = new Employee(1, 'John');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.is(jsonData, '{"id":1,"empName":"John"}');
});

test('Fail @JsonProperty with required', t => {
  class Employee {
    id: number;
    @JsonProperty({required: true})
    name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"id":1}';

  const err = t.throws<JacksonError>(() => {
    objectMapper.parse<Employee>(jsonData, {mainCreator: () => [Employee]});
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonProperty with JsonPropertyAccess.WRITE_ONLY', t => {
  class Employee {
    id: number;
    @JsonProperty({value: 'empName', access: JsonPropertyAccess.WRITE_ONLY})
    name: string;
  }

  const employee = new Employee();
  employee.id = 1;
  employee.name = 'John';

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.is(jsonData, '{"id":1}');

  const employeeParsed = objectMapper.parse<Employee>('{"id":1,"empName":"John"}', {mainCreator: () => [Employee]});
  t.assert(employeeParsed instanceof Employee);
  t.is(employeeParsed.id, 1);
  t.is(employeeParsed.name, 'John');
});

test('@JsonProperty with JsonPropertyAccess.READ_ONLY', t => {
  class Employee {
    id: number;
    @JsonProperty({value: 'empName', access: JsonPropertyAccess.READ_ONLY})
    name: string;
  }

  const employee = new Employee();
  employee.id = 1;
  employee.name = 'John';

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.is(jsonData, '{"id":1,"empName":"John"}');

  const err = t.throws<JacksonError>(() => {
    objectMapper.parse<Employee>(jsonData, {mainCreator: () => [Employee]});
  });

  t.assert(err instanceof JacksonError);
});
