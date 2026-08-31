use super::{DepRaderRouter, DepRaderRouterClient};
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(env, &sac.address()),
        StellarAssetClient::new(env, &sac.address()),
    )
}

#[test]
fn test_create_bounty_locks_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let creator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&creator, &1_000);

    let contract_id = env.register(DepRaderRouter, ());
    let client = DepRaderRouterClient::new(&env, &contract_id);

    let bounty_id = 1u64;
    let issue_ref = String::from_str(&env, "org/repo#123");
    let amount: i128 = 400;

    client.create_bounty(
        &creator,
        &bounty_id,
        &issue_ref,
        &amount,
        &token_client.address,
    );

    // Funds moved from the creator into the contract.
    assert_eq!(token_client.balance(&creator), 600);
    assert_eq!(token_client.balance(&contract_id), 400);

    // Bounty state is readable via the getter.
    let bounty = client.get_bounty(&bounty_id).expect("bounty should exist");
    assert_eq!(bounty.creator, creator);
    assert_eq!(bounty.issue_ref, issue_ref);
    assert_eq!(bounty.amount, amount);
    assert_eq!(bounty.token, token_client.address);
}
