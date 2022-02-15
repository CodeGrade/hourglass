{
  description = "hourglass";

  inputs.nixpkgs-ruby.url = "github:nixos/nixpkgs/c3072b4deea11801c45afa6bb436750e4b9905fd";

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
