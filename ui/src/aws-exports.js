import { Amplify } from 'aws-amplify';

const awsconfig = {
    Auth: {
        Cognito:{
        region: 'us-east-2',
        userPoolId: 'us-east-2_tkQVHKiTL',
        userPoolClientId: '63uh95r2deoaclc4jnjp7h76k9',
        mandatorySignIn: false,
        }
    },
};

export default awsconfig;