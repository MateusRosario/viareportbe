import { ValueTransformer } from "typeorm";

export class DateTimezoneTransformer implements ValueTransformer {
    to(value: Date) {
        console.log("to", value);
        return value;        
    }
    from(value: Date) {
        return value;
        // console.log("from", value);
    }
}
