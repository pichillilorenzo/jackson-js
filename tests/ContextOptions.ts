import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClass} from '../src/decorators/JsonClass';
import {JsonIgnore} from '../src/decorators/JsonIgnore';
import {JsonFormat, JsonFormatShape} from '../src/decorators/JsonFormat';

test('decoratorsEnabled context option', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    @JsonIgnore()
    firstname: string;
    @JsonProperty()
    @JsonIgnore()
    lastname: string;
    @JsonProperty()
    @JsonFormat({
      shape: JsonFormatShape.STRING,
      pattern: 'YYYY-MM-DD hh:mm:ss',
    })
    @JsonClass({class: () => [Date]})
    bithday: Date;

    // eslint-disable-next-line no-shadow
    constructor(id: number, email: string, firstname: string, lastname: string, bithday: Date) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
      this.bithday = bithday;
    }
  }

  const bithday = new Date(1994, 11, 14);
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa', bithday);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user, {
    decoratorsEnabled: {
      JsonIgnore: false,
      JsonFormat: false
    }
  });

  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","bithday":787359600000}'));
});
