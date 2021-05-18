{
  description = "hourglass";

  inputs.nixpkgs-ruby.url = "github:nixos/nixpkgs/3d7c120";

  outputs = { self, nixpkgs, nixpkgs-ruby }: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
    };
    rubyPkgs = import nixpkgs-ruby {
      system = "x86_64-linux";
    };
  in {
    devShell.x86_64-linux = import ./shell.nix {
      inherit pkgs;
      ruby = rubyPkgs.ruby_2_7;
    };
  };
}
